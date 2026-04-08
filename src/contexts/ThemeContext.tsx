import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@mytripcircle_dark_mode";
const SATELLITE_KEY = "@mytripcircle_satellite_map";

// ─── Palettes ─────────────────────────────────────────────────────────────────
export const lightColors = {
  // Fonds
  bg: "#F5F0E8",
  bgLight: "#FDFAF5",
  bgMid: "#EDE5D8",
  bgDark: "#D8CCBA",
  // Cartes / surfaces
  surface: "#FFFFFF",
  surfaceSecondary: "#FDFAF5",
  // Bordures
  border: "#D8CCBA",
  borderLight: "#EDE5D8",
  // Texte
  text: "#2A2318",
  textMid: "#7A6A58",
  textLight: "#B0A090",
  // Accent terracotta
  terra: "#C4714A",
  terraLight: "#F5E5DC",
  terraDark: "#A35830",
  // États
  danger: "#C04040",
  dangerLight: "#FDEAEA",
  // Divers
  white: "#FFFFFF",
  statusBar: "dark-content" as "dark-content" | "light-content",
};

export const darkColors = {
  // Fonds
  bg: "#1A1714",
  bgLight: "#201D1A",
  bgMid: "#262220",
  bgDark: "#2E2A27",
  // Cartes / surfaces
  surface: "#262220",
  surfaceSecondary: "#2E2A27",
  // Bordures
  border: "#3A3530",
  borderLight: "#302C28",
  // Texte
  text: "#F0E8DC",
  textMid: "#A89880",
  textLight: "#7A6A58",
  // Accent terracotta (identique)
  terra: "#C4714A",
  terraLight: "#3D2418",
  terraDark: "#E08060",
  // États
  danger: "#E05050",
  dangerLight: "#2E1818",
  // Divers
  white: "#FFFFFF",
  statusBar: "light-content" as "dark-content" | "light-content",
};

export type AppColors = typeof lightColors;

// ─── Context ──────────────────────────────────────────────────────────────────
interface ThemeContextType {
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => void;
  satelliteMap: boolean;
  toggleSatelliteMap: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  satelliteMap: false,
  toggleSatelliteMap: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");
  const [satelliteMap, setSatelliteMap] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === null) {
        // Pas de préférence manuelle → suivre le thème système
        setIsDark(systemScheme === "dark");
      } else {
        setIsDark(val === "true");
      }
    });
    AsyncStorage.getItem(SATELLITE_KEY).then((val) => {
      if (val !== null) setSatelliteMap(val === "true");
    });
  }, []);

  // Suivre les changements système si l'utilisateur n'a pas de préférence manuelle
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === null) setIsDark(systemScheme === "dark");
    });
  }, [systemScheme]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const toggleSatelliteMap = () => {
    setSatelliteMap((prev) => {
      const next = !prev;
      AsyncStorage.setItem(SATELLITE_KEY, String(next));
      return next;
    });
  };

  const ctxValue = useMemo(
    () => ({ isDark, colors: isDark ? darkColors : lightColors, toggleTheme, satelliteMap, toggleSatelliteMap }),
    [isDark, satelliteMap, toggleTheme, toggleSatelliteMap],
  );

  return (
    <ThemeContext.Provider value={ctxValue}>
      {children}
    </ThemeContext.Provider>
  );
};
