import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import ApiService from "../services/ApiService";

export type AuthField = "email" | "password" | "name" | "phone";
export type AuthResult =
  | { success: true }
  | { success: false; error: string; field?: AuthField; requiresOtp?: boolean; userId?: string };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<AuthResult & { userId?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  verifyOtp: (
    userId: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const parseApiError = (
    error: unknown,
  ): { message: string; field?: AuthField; requiresOtp?: boolean; userId?: string } => {
    const defaultMessage = "An unexpected error occurred";

    const raw = error instanceof Error ? error.message : String(error);
    try {
      const parsed = JSON.parse(raw) as {
        error?: string;
        message?: string;
        field?: AuthField;
        requiresOtp?: boolean;
        userId?: string;
      };
      const message = parsed.error || parsed.message || defaultMessage;
      return { message, field: parsed.field, requiresOtp: parsed.requiresOtp, userId: parsed.userId };
    } catch {
      return { message: raw || defaultMessage };
    }
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        // Convert date strings back to Date objects
        setUser({
          ...user,
          createdAt: new Date(user.createdAt),
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const res = await ApiService.login({ email, password });

      // Check if user needs to verify OTP first
      if (res && res.requiresOtp && res.userId) {
        return { success: false, error: res.error || "Please verify your account", requiresOtp: true, userId: res.userId };
      }

      if (!res?.success || !res?.token || !res?.user) {
        return { success: false, error: "Login failed" };
      }

      await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.user));
      setUser({
        ...res.user,
        createdAt: new Date(res.user.createdAt),
      });
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const parsed = parseApiError(error);
      // Check if user needs to verify OTP (from error response)
      if (parsed.requiresOtp && parsed.userId) {
        return { success: false, error: parsed.message, requiresOtp: true, userId: parsed.userId };
      }
      return { success: false, error: parsed.message, field: parsed.field };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<AuthResult & { userId?: string }> => {
    try {
      const res = await ApiService.register({ name, email, password, phone });
      if (!res?.success) {
        return { success: false, error: res?.error || "Registration failed" };
      }

      // If OTP is required, return userId for OTP verification
      if (res.userId && !res.token) {
        return { success: true, userId: res.userId };
      }

      // If token is provided, user is already verified (no OTP flow)
      if (res.token && res.user) {
        await AsyncStorage.setItem("token", res.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.user));
        setUser({
          ...res.user,
          createdAt: new Date(res.user.createdAt),
        });
      }

      return { success: true, userId: res.userId };
    } catch (error) {
      console.error("Registration error:", error);
      const parsed = parseApiError(error);
      return { success: false, error: parsed.message, field: parsed.field };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    const token = await AsyncStorage.getItem("token");

    const filteredData = Object.fromEntries(
      Object.entries(userData).filter(([, value]) => value !== undefined),
    ) as { name?: string; email?: string };

    const res = await ApiService.updateProfile(
      filteredData as { name: string; email: string },
    );

    if (res.success) {
      await AsyncStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);
    }
  };

  const verifyOtp = async (
    userId: string,
    otp: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await ApiService.verifyOtp({ userId, otp });
      if (!res?.success) {
        return {
          success: false,
          error: res?.error || "OTP verification failed",
        };
      }

      if (res.token && res.user) {
        await AsyncStorage.setItem("token", res.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.user));
        setUser({
          ...res.user,
          createdAt: new Date(res.user.createdAt),
        });
      }

      return { success: true };
    } catch (error) {
      console.error("OTP verification error:", error);
      const parsed = parseApiError(error);
      return { success: false, error: parsed.message };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      const res = await ApiService.changePassword({
        currentPassword,
        newPassword,
      });

      return !!res?.success;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      changePassword,
      verifyOtp,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
