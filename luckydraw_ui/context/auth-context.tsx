// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { logger } from "../utils/logger";
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchMe,
  getToken,
  type User,
  type LoginPayload,
  type RegisterPayload,
  type LoginResponse,
} from "../requests/auth";

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // On mount, if token exists, fetch /me
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setInitializing(false);
      return;
    }

    logger.info("Token found, fetching current user");
    fetchMe()
      .then((data) => {
        logger.info("Current user loaded:", data.id);
        setUser(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          logger.error("Failed to load current user:", err.message);
        } else {
          logger.error("Failed to load current user:", err);
        }
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);

  const handleLogin = async (
    credentials: LoginPayload
  ): Promise<LoginResponse> => {
    setLoading(true);
    try {
      const data = await loginUser(credentials);
      logger.info("Login success, setting user");
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (payload: RegisterPayload): Promise<User> => {
    setLoading(true);
    try {
      const newUser = await registerUser(payload);
      logger.info("Register success, user created:", newUser.id);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutUser();
      logger.info("Logout success, clearing user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = (updatedUser: User): void => {
    logger.info("Updating user in context:", updatedUser.id);
    setUser(updatedUser);
  };

  const handleRefreshUser = async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const data = await fetchMe();
      logger.info("User refreshed:", data.id);
      setUser(data);
    } catch (err) {
      logger.error("Failed to refresh user:", err);
      setUser(null);
    }
  };

  const value: AuthContextValue = {
    user,
    initializing,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    refreshUser: handleRefreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
