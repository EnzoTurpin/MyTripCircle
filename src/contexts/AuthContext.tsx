import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import ApiService from "../services/ApiService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; userId?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  verifyOtp: (userId: string, otp: string) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
  const res = await ApiService.login({ email, password });
  if (!res?.success) return false;

  await AsyncStorage.setItem("user", JSON.stringify(res.user));
  await AsyncStorage.setItem("token", res.token);

  setUser(res.user);
  return true;
};


  const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; userId?: string }> => {
  try {
    const res = await ApiService.register({ name, email, password });

    console.log("REGISTER RESPONSE:", res);

    if (!res?.success) {
      return { success: false };
    }

    return {
      success: true,
      userId: res.userId,
    };
  } catch (error) {
    console.error("REGISTER FRONT ERROR:", error);
    return { success: false };
  }
};


  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const verifyOtp = async (userId: string, otp: string): Promise<boolean> => {
    const res = await ApiService.verifyOtp({ userId, otp });
    if (!res?.success) return false;

    await AsyncStorage.setItem("user", JSON.stringify(res.user));
    await AsyncStorage.setItem("token", res.token);

    setUser(res.user);
    return true;
  };


  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
