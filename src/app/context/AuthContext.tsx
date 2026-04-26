import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getToken, setToken as saveToken, removeToken as deleteToken, isTokenValid } from "../../utils/auth";

export type UserRole = "customer" | "plumber" | "electrician" | "ac-repair" | "carpenter" | "painter" | "cleaning";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  rating?: number;
  completedJobs?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://localhost:5000/api/v1/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getToken();
      
      if (storedToken && isTokenValid()) {
        try {
          const res = await fetch(`${API_URL}/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });

          if (res.ok) {
            const data = await res.json();
            const userData = data.data.user;
            const mappedUser: User = {
              id: userData._id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone || "",
              role: userData.role,
              avatar: userData.avatar?.url || undefined,
            };
            setUser(mappedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            deleteToken();
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          deleteToken();
        }
      } else if (storedToken) {
        // Token exists but is invalid/expired
        deleteToken();
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const { user: userData, accessToken } = data.data;

      const mappedUser: User = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        role: userData.role,
        avatar: userData.avatar?.url || undefined,
      };

      setUser(mappedUser);
      setToken(accessToken);
      setIsAuthenticated(true);
      saveToken(accessToken);
      
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, phone: string, role: UserRole) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      const { user: userData, accessToken } = data.data;

      const mappedUser: User = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        role: userData.role,
        avatar: userData.avatar?.url || undefined,
      };

      setUser(mappedUser);
      setToken(accessToken);
      setIsAuthenticated(true);
      saveToken(accessToken);
      
    } catch (error: any) {
      console.error("Signup Error:", error);
      throw error;
    }
  };

  const logout = () => {
    // Step 1: Remove token
    deleteToken();

    // Step 2: Reset State
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Step 3: Fire and forget backend logout
    if (token) {
      fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(console.error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, token, login, signup, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
