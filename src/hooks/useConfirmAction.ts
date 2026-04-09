import { Alert } from "react-native";

interface ConfirmActionOptions {
  title: string;
  message: string;
  cancelText?: string;
  confirmText: string;
  confirmStyle?: "destructive" | "default";
  onConfirm: () => Promise<void> | void;
}

export function useConfirmAction() {
  const confirm = ({
    title,
    message,
    cancelText = "Annuler",
    confirmText,
    confirmStyle = "destructive",
    onConfirm,
  }: ConfirmActionOptions) => {
    Alert.alert(title, message, [
      { text: cancelText, style: "cancel" },
      { text: confirmText, style: confirmStyle, onPress: onConfirm },
    ]);
  };

  return { confirm };
}
