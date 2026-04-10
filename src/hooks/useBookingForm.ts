import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Booking } from "../types";
import { type AddressSuggestion } from "../services/PlacesService";
import { type ScannedBookingData } from "../components/TicketScannerModal";
import useAttachmentManager, { type Attachment } from "./useAttachmentManager";
import useAddressAutocomplete from "./useAddressAutocomplete";

export type { Attachment };

interface Props {
  visible: boolean;
  initialBooking?: Partial<Booking>;
  tripStartDate?: Date;
  tripEndDate?: Date;
  preselectedTripId?: string;
  onSave: (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const parseDate = (date: Date | string | undefined, fallback: Date): Date => {
  if (!date) return fallback;
  if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

export const needsEndDate = (type: Booking["type"]): boolean => type === "hotel";

export function useBookingForm({
  visible,
  initialBooking,
  tripStartDate,
  tripEndDate: _tripEndDate,
  preselectedTripId,
  onSave,
  onClose,
}: Props) {
  const { t } = useTranslation();

  const attachments = useAttachmentManager(t);
  const addressAC   = useAddressAutocomplete();

  const buildInitialFormData = () => {
    const now = new Date();
    const tripStart = tripStartDate ? parseDate(tripStartDate, now) : now;
    const initialDate = initialBooking?.date ? parseDate(initialBooking.date, tripStart) : tripStart;
    const initialEnd = (initialBooking as any)?.endDate
      ? parseDate((initialBooking as any).endDate, new Date(initialDate.getTime() + ONE_DAY_MS))
      : new Date(initialDate.getTime() + ONE_DAY_MS);
    return {
      type:               initialBooking?.type ?? "flight",
      title:              initialBooking?.title || "",
      description:        initialBooking?.description || "",
      date:               initialDate,
      endDate:            initialEnd,
      time:               initialBooking?.time || "",
      address:            initialBooking?.address || "",
      confirmationNumber: initialBooking?.confirmationNumber || "",
      status:             initialBooking?.status ?? "pending",
    };
  };

  const [formData, setFormData] = useState(buildInitialFormData);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; endDate?: string }>({});
  const [showDatePicker,    setShowDatePicker]    = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker,    setShowTimePicker]    = useState(false);
  const [showScanner,       setShowScanner]       = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFormData(buildInitialFormData());
    attachments.setAttachments(
      initialBooking?.attachments?.map((entry) => {
        const [name, uri] = entry.includes("::") ? entry.split("::") : [entry.split("/").pop() || entry, entry];
        return { uri, name, type: name.toLowerCase().endsWith(".pdf") ? ("pdf" as const) : ("image" as const) };
      }) ?? [],
    );
    setFieldErrors({});
  }, [visible, initialBooking]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next: any = { ...prev, [field]: value };
      if (field === "type") {
        if (!needsEndDate(value as Booking["type"])) next.endDate = undefined;
        else if (!prev.endDate) next.endDate = new Date(prev.date.getTime() + ONE_DAY_MS);
      }
      return next;
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date, dateType: "start" | "end" = "start") => {
    const hide = () => dateType === "start" ? setShowDatePicker(false) : setShowEndDatePicker(false);
    if (Platform.OS === "android") hide();
    if (selectedDate) {
      const date = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      if (Number.isNaN(date.getTime())) return;
      if (dateType === "start") {
        setFormData((prev) => ({
          ...prev, date,
          ...(prev.endDate && date > prev.endDate ? { endDate: new Date(date.getTime() + ONE_DAY_MS) } : {}),
        }));
      } else {
        setFormData((prev) => {
          if (date < prev.date) { Alert.alert(t("common.error"), t("bookings.endDateBeforeStart")); return prev; }
          return { ...prev, endDate: date };
        });
      }
    } else if (Platform.OS === "ios" && event.type === "dismissed") {
      hide();
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (selectedTime) {
      const hh = selectedTime.getHours().toString().padStart(2, "0");
      const mm = selectedTime.getMinutes().toString().padStart(2, "0");
      setFormData((prev) => ({ ...prev, time: `${hh}:${mm}` }));
    } else if (Platform.OS === "ios" && event.type === "dismissed") {
      setShowTimePicker(false);
    }
  };

  const getTimePickerValue = (): Date => {
    const base = new Date(formData.date);
    if (formData.time) {
      const [h, m] = formData.time.split(":");
      base.setHours(Number.parseInt(h, 10), Number.parseInt(m, 10), 0, 0);
      return base;
    }
    base.setHours(12, 0, 0, 0);
    return base;
  };

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!formData.title.trim()) errors.title = t("bookings.titleRequired");
    if (needsEndDate(formData.type) && formData.endDate && formData.endDate < formData.date)
      errors.endDate = t("bookings.endDateBeforeStart");
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return false; }
    setFieldErrors({});
    return true;
  };

  const handleScanFill = (data: ScannedBookingData) => {
    setFormData((prev) => ({
      ...prev,
      ...(data.type ? { type: data.type } : {}),
      ...(data.title ? { title: data.title } : {}),
      ...(data.time ? { time: data.time } : {}),
      ...(data.address ? { address: data.address } : {}),
      ...(data.confirmationNumber ? { confirmationNumber: data.confirmationNumber } : {}),
      ...(data.date instanceof Date && !Number.isNaN(data.date.getTime()) ? { date: data.date } : {}),
      ...(data.endDate instanceof Date && !Number.isNaN(data.endDate.getTime()) ? { endDate: data.endDate } : {}),
    }));
  };

  const handleAddressChange = (text: string) =>
    addressAC.handleAddressChange(text, (v) => handleInputChange("address", v));

  const handleSelectAddress = (suggestion: AddressSuggestion) =>
    addressAC.handleSelectAddress(suggestion, (desc) => handleInputChange("address", desc));

  const handleSave = () => {
    if (!validateForm()) return;
    onSave({
      tripId:             preselectedTripId || "",
      type:               formData.type,
      title:              formData.title.trim(),
      description:        formData.description.trim() || undefined,
      date:               formData.date,
      endDate:            needsEndDate(formData.type) && formData.endDate ? formData.endDate : undefined,
      time:               formData.time || undefined,
      address:            formData.address.trim() || undefined,
      confirmationNumber: formData.confirmationNumber.trim() || undefined,
      status:             formData.status,
      attachments:        attachments.attachments.length > 0 ? attachments.attachments.map((a) => `${a.name}::${a.uri}`) : undefined,
    });
    onClose();
  };

  return {
    formData,
    fieldErrors, setFieldErrors,
    showDatePicker, setShowDatePicker,
    showEndDatePicker, setShowEndDatePicker,
    showTimePicker, setShowTimePicker,
    showScanner, setShowScanner,
    handleInputChange, handleDateChange, handleTimeChange, getTimePickerValue,
    handleScanFill, handleSave,
    // Attachments
    attachments:           attachments.attachments,
    renamingIndex:         attachments.renamingIndex,
    setRenamingIndex:      attachments.setRenamingIndex,
    renameValue:           attachments.renameValue,
    setRenameValue:        attachments.setRenameValue,
    handlePickImage:       attachments.handlePickImage,
    handlePickDocument:    attachments.handlePickDocument,
    handleOpenRename:      attachments.handleOpenRename,
    handleConfirmRename:   attachments.handleConfirmRename,
    handleRemoveAttachment: attachments.handleRemoveAttachment,
    // Address
    addressSuggestions:    addressAC.addressSuggestions,
    showAddressSuggestions: addressAC.showAddressSuggestions,
    handleAddressChange,
    handleSelectAddress,
  };
}
