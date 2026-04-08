import { useState, useRef } from "react";
import { Animated } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import BarcodeScanner from "@react-native-ml-kit/barcode-scanning";
import { useTranslation } from "react-i18next";
import { Booking } from "../types";

export interface ScannedBookingData {
  type?: Booking["type"];
  title?: string;
  date?: Date;
  endDate?: Date;
  time?: string;
  address?: string;
  confirmationNumber?: string;
}

export type ScanMode = "choose" | "camera" | "gallery";

function julianToDate(julian: number): Date {
  const year = new Date().getFullYear();
  const d = new Date(year, 0, julian);
  if (d.getTime() < Date.now() - 30 * 86_400_000) {
    return new Date(year + 1, 0, julian);
  }
  return d;
}

function parseBCBP(raw: string): ScannedBookingData | null {
  if (!raw.startsWith("M") || raw.length < 58) return null;

  const pnr       = raw.substring(23, 30).trim();
  const from      = raw.substring(30, 33).trim();
  const to        = raw.substring(33, 36).trim();
  const carrier   = raw.substring(36, 39).trim();
  const flightNum = raw.substring(39, 44).trim().replace(/^0+/, "");
  const julianRaw = raw.substring(44, 47).trim();

  const julian = Number.parseInt(julianRaw, 10);
  const date   = Number.isNaN(julian) ? undefined : julianToDate(julian);

  const flightSuffix = flightNum ? ` · ${carrier.trim()}${flightNum}` : "";
  const title = `${from} → ${to}${flightSuffix}`;

  return {
    type: "flight",
    title,
    date,
    confirmationNumber: pnr || undefined,
  };
}

const ISO_DATE_RE = /(\d{4}-\d{2}-\d{2})/;
const FR_DATE_RE = /(\d{2})[/\-.](\d{2})[/\-.](\d{4})/;
const TIME_RE = /\b(\d{2}):(\d{2})\b/;
const ROUTE_RE = /([A-ZÉÈÊ-]{2,30}(?:\s[A-ZÉÈÊ-]{1,30}){0,4})\s*[>→]\s*([A-ZÉÈÊ-]{2,30}(?:\s[A-ZÉÈÊ-]{1,30}){0,4})/i;
const PNR_RE = /\b([A-Z0-9]{5,9})\b/;

function parseGeneric(raw: string): ScannedBookingData {
  const data: ScannedBookingData = {};

  const isoDate = ISO_DATE_RE.exec(raw);
  if (isoDate) {
    const d = new Date(isoDate[1]);
    if (!Number.isNaN(d.getTime())) data.date = d;
  } else {
    const frDate = FR_DATE_RE.exec(raw);
    if (frDate) {
      const d = new Date(`${frDate[3]}-${frDate[2]}-${frDate[1]}`);
      if (!Number.isNaN(d.getTime())) data.date = d;
    }
  }

  const timeMatch = TIME_RE.exec(raw);
  if (timeMatch) data.time = `${timeMatch[1]}:${timeMatch[2]}`;

  const routeMatch = ROUTE_RE.exec(raw);
  if (routeMatch) {
    data.title = `${routeMatch[1].trim()} → ${routeMatch[2].trim()}`;
    const lower = raw.toLowerCase();
    if (lower.includes("train") || lower.includes("sncf") || lower.includes("tgv")) {
      data.type = "train";
    } else if (lower.includes("vol") || lower.includes("flight") || lower.includes("boarding")) {
      data.type = "flight";
    }
  }

  const pnrMatch = PNR_RE.exec(raw);
  if (pnrMatch) data.confirmationNumber = pnrMatch[1];

  return data;
}

function parseBarcode(raw: string): ScannedBookingData {
  return parseBCBP(raw) ?? parseGeneric(raw);
}

export function useTicketScanner(
  visible: boolean,
  onFill: (data: ScannedBookingData) => void,
  onClose: () => void
) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  const [mode, setMode]             = useState<ScanMode>("choose");
  const [scanned, setScanned]       = useState(false);
  const [parsedData, setParsedData] = useState<ScannedBookingData | null>(null);
  const [rawData, setRawData]       = useState<string>("");
  const [scanning, setScanning]     = useState(false);
  const [scanError, setScanError]   = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const panelAnim = useRef(new Animated.Value(300)).current;

  const showPanel = () => {
    Animated.spring(panelAnim, {
      toValue: 0, useNativeDriver: true, tension: 70, friction: 12,
    }).start();
  };

  const hidePanel = (cb?: () => void) => {
    Animated.timing(panelAnim, {
      toValue: 300, duration: 200, useNativeDriver: true,
    }).start(cb);
  };

  const reset = () => {
    setScanned(false);
    setParsedData(null);
    setRawData("");
    setScanError(null);
    setPreviewUri(null);
    panelAnim.setValue(300);
  };

  const handleResult = (raw: string) => {
    setRawData(raw);
    setParsedData(parseBarcode(raw));
    setScanned(true);
    showPanel();
  };

  const handleFill = () => {
    if (parsedData) {
      onFill(parsedData);
      onClose();
    }
  };

  const handleRescan = () => {
    hidePanel(() => {
      reset();
      if (mode === "gallery") setMode("choose");
    });
  };

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    handleResult(data);
  };

  const scanFromImage = async (uri: string) => {
    setPreviewUri(uri);
    setMode("gallery");
    setScanning(true);
    setScanError(null);
    try {
      const results = await BarcodeScanner.scan(uri);
      if (results.length > 0) {
        handleResult(results[0].value);
      } else {
        setScanError(t("bookings.scanNoCodeFound"));
      }
    } catch {
      setScanError(t("bookings.scanNoCodeFound"));
    } finally {
      setScanning(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setScanError(t("bookings.permissionDenied"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]) {
      await scanFromImage(result.assets[0].uri);
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      await scanFromImage(result.assets[0].uri);
    }
  };

  return {
    t,
    permission,
    requestPermission,
    mode,
    setMode,
    scanned,
    parsedData,
    rawData,
    scanning,
    scanError,
    previewUri,
    panelAnim,
    reset,
    handleFill,
    handleRescan,
    handleBarcodeScanned,
    handlePickImage,
    handlePickDocument,
  };
}
