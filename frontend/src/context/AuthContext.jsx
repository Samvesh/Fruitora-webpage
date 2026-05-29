import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("fruitora_user");
    return raw ? JSON.parse(raw) : null;
  });

  const saveSession = ({ user: nextUser, token }) => {
    localStorage.setItem("fruitora_user", JSON.stringify(nextUser));
    localStorage.setItem("fruitora_token", token);
    setUser(nextUser);
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    saveSession(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("fruitora_user");
    localStorage.removeItem("fruitora_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
