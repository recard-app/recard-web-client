import { createContext, useContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';

export interface AuthContextType {
  user: FirebaseUser | null;
  login: () => Promise<{ user: FirebaseUser; token: string; isNewUser: boolean }>;
  loginWithEmail: (email: string, password: string) => Promise<{ user: FirebaseUser; token: string }>;
  registerWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<{ user: FirebaseUser; token: string }>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateDisplayName: (newName: string) => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
