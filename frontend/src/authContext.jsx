import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "gcc_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentCustomerName, setCurrentCustomerName] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
        setCurrentCustomerName(parsed.currentCustomerName || null);
      }
    } catch (e) {
      console.warn("Failed to load auth from storage", e);
    }
  }, []);

  const saveState = (nextUser, nextCustomer) => {
    setUser(nextUser);
    setCurrentCustomerName(nextCustomer ?? null);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: nextUser, currentCustomerName: nextCustomer ?? null })
      );
    } catch (e) {
      console.warn("Failed to persist auth state", e);
    }
  };

  const login = (userPayload) => {
    saveState(userPayload, userPayload.customerName || null);
  };

  const logout = () => {
    saveState(null, null);
  };

  const selectCustomer = (customerName) => {
    if (!user) return;
    saveState(user, customerName);
  };

  const value = {
    user,
    currentCustomerName,
    login,
    logout,
    selectCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
