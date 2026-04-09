import { useRef } from "react";
import { Animated } from "react-native";

interface UseBottomSheetOptions {
  outputRange?: [number, number];
  bounciness?: number;
}

export function useBottomSheet({
  outputRange = [340, 0],
  bounciness = 4,
}: UseBottomSheetOptions = {}) {
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const open = () => {
    Animated.parallel([
      Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, bounciness }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const close = (onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(sheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(onComplete ? () => onComplete() : undefined);
  };

  const translateY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange });

  return { sheetAnim, backdropAnim, translateY, open, close };
}
