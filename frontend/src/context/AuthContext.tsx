import React, { createContext, useContext, useEffect, useState } from "react";
import api, { API_BASE } from "../api/api";
import TokenService from "../services/tokenService";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type User = { id?: string; email: string; role?: string } | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMe = async (tokenOverride?: string) => {
    try {
      const res = await api.get("/api/auth/me", {
        headers: tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : {},
      });
      setUser(res.data);
    } catch (e) {
      setUser(null);
    }
  };

  // On mount → try refresh, then fetch user
  useEffect(() => {
    (async () => {
      try {
        const r = await axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true });
        const token = r.data?.accessToken;
        if (token) {
          TokenService.updateLocalAccessToken(token);
          await fetchMe(token);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(
      `${API_BASE}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    const token = res.data?.accessToken;
    if (token) {
      TokenService.updateLocalAccessToken(token);
      await fetchMe(token); // ✅ set user immediately
      navigate("/events");  // ✅ redirect after login
    }
  };

  const register = async (email: string, password: string) => {
    await api.post("/api/auth/register", { email, password });
    await login(email, password); // auto-login & redirect
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
    } catch {
      // ignore
    }
    TokenService.removeLocalAccessToken();
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
