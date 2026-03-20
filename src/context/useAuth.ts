import { createContext, useContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { SyncStatus } from '../services/AuthService';

export interface AuthContextType {
  user: FirebaseUser | null;
  login: () => Promise<{ user: FirebaseUser; token: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ user: FirebaseUser; token: string }>;
  registerWithEmail: (email: string, password: string) => Promise<{ user: FirebaseUser; token: string }>;
  syncAccount: (options?: { firstName?: string; lastName?: string }) => Promise<{ status: SyncStatus }>;
  authSyncState: 'idle' | 'syncing' | 'ready' | 'error';
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
