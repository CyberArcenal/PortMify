// src/contexts/AuthContext.tsx
import { AuthState, authStore } from "@/lib/authStore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType extends AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isError: boolean;
  logout: () => void;
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
  const [state, setState] = useState<AuthState>(authStore.getState());
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setState(authStore.getState());
      setIsLoading(false);
    };

    init();

    const storageCb = () => setState(authStore.getState());
    authStore.subscribe(storageCb);

    const eventCb = () => setState(authStore.getState());
    document.addEventListener("authStateChanged", eventCb);

    return () => {
      document.removeEventListener("authStateChanged", eventCb);
    };
  }, []);

  const logout = () => {
    authStore.logout();
  };

  const isAuthenticated = !!state.user && !!state.accessToken;

  return (
    <AuthContext.Provider
      value={{ ...state, isLoading, isAuthenticated, isError, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};