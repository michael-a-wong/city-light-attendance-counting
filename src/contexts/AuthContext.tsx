/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  password: string | null;
  setPassword: (password: string) => void;
  clearPassword: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize password from sessionStorage if available
  const [password, setPasswordState] = useState<string | null>(() => {
    return sessionStorage.getItem('clbc-password');
  });

  const setPassword = (pwd: string) => {
    sessionStorage.setItem('clbc-password', pwd);
    setPasswordState(pwd);
  };

  const clearPassword = () => {
    sessionStorage.removeItem('clbc-password');
    setPasswordState(null);
  };

  return (
    <AuthContext.Provider value={{ password, setPassword, clearPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
