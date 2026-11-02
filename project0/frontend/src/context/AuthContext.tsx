
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthProviderProps = {
  children: ReactNode;
};

function hasValidToken() {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return typeof payload.exp === "number" &&
      payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    hasValidToken
  );

  const login = (token: string) => {
    localStorage.setItem("token", token);
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
