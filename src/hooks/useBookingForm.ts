import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Booking } from "../types";
import {
  getAddressSuggestions,
  hasGooglePlacesApiKey,
  type AddressSuggestion,
} from "../services/PlacesService";
import { useCurrentLocation } from "./useCurrentLocation";
import { type ScannedBookingData } from "../components/TicketScannerModal";

export type Attachment = { uri: string; name: string; type: "image" | "pdf" };

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
  tripEndDate,
  preselectedTripId,
  onSave,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const currentLocation = useCurrentLocation();

  const buildInitialFormData = () => {
    const now = new Date();
    const tripStart = tripStartDate ? parseDate(tripStartDate, now) : now;
    const initialDate = initialBooking?.date
      ? parseDate(initialBooking.date, tripStart)
      : tripStart;
    const initialEnd = (initialBooking as any)?.endDate
      ? parseDate(
          (initialBooking as any).endDate,
          new Date(initialDate.getTime() + ONE_DAY_MS),
        )
      : new Date(initialDate.getTime() + ONE_DAY_MS);
    return {
      type: initialBooking?.type ?? "flight",
      title: initialBooking?.title || "",
      description: initialBooking?.description || "",
      date: initialDate,
      endDate: initialEnd,
      time: initialBooking?.time || "",
      address: initialBooking?.address || "",
      confirmationNumber: initialBooking?.confirmationNumber || "",
      status: initialBooking?.status ?? "pending",
    };
  };

  const [formData, setFormData] = useState(buildInitialFormData);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; endDate?: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFormData(buildInitialFormData());
    setAttachments(
      initialBooking?.attachments?.map((entry) => {
        const [name, uri] = entry.includes("::")
          ? entry.split("::")
          : [entry.split("/").pop() || entry, entry];
        return {
          uri,
          name,
          type: name.toLowerCase().endsWith(".pdf")
            ? ("pdf" as const)
            : ("image" as const),
        };
      }) ?? [],
    );
    setFieldErrors({});
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  }, [visible, initialBooking]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next: any = { ...prev, [field]: value };
      if (field === "type") {
        if (!needsEndDate(value as Booking["type"])) next.endDate = undefined;
        else if (!prev.endDate)
          next.endDate = new Date(prev.date.getTime() + ONE_DAY_MS);
      }
      return next;
    });
  };

  const handleDateChange = (
    event: any,
    selectedDate?: Date,
    dateType: "start" | "end" = "start",
  ) => {
    const hide = () =>
      dateType === "start" ? setShowDatePicker(false) : setShowEndDatePicker(false);
    if (Platform.OS === "android") hide();
    if (selectedDate) {
      const date =
        selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      if (Number.isNaN(date.getTime())) return;
      if (dateType === "start") {
        setFormData((prev) => ({
          ...prev,
          date,
          ...(prev.endDate && date > prev.endDate
            ? { endDate: new Date(date.getTime() + ONE_DAY_MS) }
            : {}),
        }));
      } else {
        setFormData((prev) => {
          if (date < prev.date) {
            Alert.alert(t("common.error"), t("bookings.endDateBeforeStart"));
            return prev;
          }
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
    if (
      needsEndDate(formData.type) &&
      formData.endDate &&
      formData.endDate < formData.date
    )
      errors.endDate = t("bookings.endDateBeforeStart");
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("common.error"), t("bookings.permissionDenied"));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        quality: 0.7,
        exif: false,
        base64: false,
      });
      if (!result.canceled && result.assets) {
        const newItems = result.assets
          .filter((a) => a.uri)
          .map((a) => ({
            uri: a.uri,
            name: a.fileName || `image_${Date.now()}.jpg`,
            type: "image" as const,
          }));
        setAttachments((prev) => {
          if (newItems.length === 1) {
            setRenameValue("");
            setRenamingIndex(prev.length);
          }
          return [...prev, ...newItems];
        });
      }
    } catch {
      Alert.alert(t("common.error"), t("bookings.imagePickerError"));
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets) {
        const newItems = result.assets.map((a) => ({
          uri: a.uri,
          name: a.name,
          type: a.mimeType?.includes("pdf") ? ("pdf" as const) : ("image" as const),
        }));
        setAttachments((prev) => {
          if (newItems.length === 1) {
            setRenameValue("");
            setRenamingIndex(prev.length);
          }
          return [...prev, ...newItems];
        });
      }
    } catch {
      Alert.alert(t("common.error"), t("bookings.documentPickerError"));
    }
  };

  const handleScanFill = (data: ScannedBookingData) => {
    setFormData((prev) => ({
      ...prev,
      ...(data.type ? { type: data.type } : {}),
      ...(data.title ? { title: data.title } : {}),
      ...(data.time ? { time: data.time } : {}),
      ...(data.address ? { address: data.address } : {}),
      ...(data.confirmationNumber
        ? { confirmationNumber: data.confirmationNumber }
        : {}),
      ...(data.date instanceof Date && !Number.isNaN(data.date.getTime())
        ? { date: data.date }
        : {}),
      ...(data.endDate instanceof Date && !Number.isNaN(data.endDate.getTime())
        ? { endDate: data.endDate }
        : {}),
    }));
  };

  const handleAddressChange = async (text: string) => {
    handleInputChange("address", text);
    if (!hasGooglePlacesApiKey || !text.trim()) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }
    try {
      const controller = new AbortController();
      const results = await getAddressSuggestions(
        text.trim(),
        controller.signal,
        currentLocation ?? undefined,
      );
      setAddressSuggestions(results);
      setShowAddressSuggestions(results.length > 0);
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        console.error("Address suggestions error:", error);
    }
  };

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    setFormData((prev) => ({ ...prev, address: suggestion.description }));
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  const handleOpenRename = (index: number) => {
    setRenameValue("");
    setRenamingIndex(index);
  };

  const handleConfirmRename = () => {
    if (renamingIndex === null) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    const ext = attachments[renamingIndex].name.match(/\.[^.]+$/)?.[0] || "";
    setAttachments((prev) =>
      prev.map((a, i) => (i === renamingIndex ? { ...a, name: trimmed + ext } : a)),
    );
    setRenamingIndex(null);
  };

  const handleRemoveAttachment = (index: number) => {
    const removeAtIndex = (prev: typeof attachments) => prev.filter((_, i) => i !== index);
    Alert.alert(t("common.confirm"), t("bookings.removeAttachmentConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => setAttachments(removeAtIndex) },
    ]);
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave({
      tripId: preselectedTripId || "",
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: formData.date,
      endDate:
        needsEndDate(formData.type) && formData.endDate
          ? formData.endDate
          : undefined,
      time: formData.time || undefined,
      address: formData.address.trim() || undefined,
      confirmationNumber: formData.confirmationNumber.trim() || undefined,
      status: formData.status,
      attachments:
        attachments.length > 0
          ? attachments.map((a) => `${a.name}::${a.uri}`)
          : undefined,
    });
    onClose();
  };

  return {
    formData,
    attachments,
    renamingIndex,
    setRenamingIndex,
    renameValue,
    setRenameValue,
    addressSuggestions,
    showAddressSuggestions,
    fieldErrors,
    setFieldErrors,
    showDatePicker,
    setShowDatePicker,
    showEndDatePicker,
    setShowEndDatePicker,
    showTimePicker,
    setShowTimePicker,
    showScanner,
    setShowScanner,
    handleInputChange,
    handleDateChange,
    handleTimeChange,
    getTimePickerValue,
    handlePickImage,
    handlePickDocument,
    handleScanFill,
    handleAddressChange,
    handleSelectAddress,
    handleOpenRename,
    handleConfirmRename,
    handleRemoveAttachment,
    handleSave,
  };
}
