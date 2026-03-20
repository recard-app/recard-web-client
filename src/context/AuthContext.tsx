import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { auth } from '../config/firebase';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { PLACEHOLDER_PROFILE_IMAGE, LOADING_ICON, COLORS } from '../types';
import Icon from '../icons';
import { logError } from '../utils/logger';
import { AuthService, type SyncStatus } from '../services/AuthService';
import { AuthContext } from './useAuth';
import type { AuthContextType } from './useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

const DEFAULT_PROFILE_PICTURE = PLACEHOLDER_PROFILE_IMAGE;

/**
 * AuthProvider component handles Firebase authentication state and methods.
 * Provides authentication context to child components.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authSyncState, setAuthSyncState] = useState<'idle' | 'syncing' | 'ready' | 'error'>('idle');

  // Suppresses background sync for one auth state change after explicit
  // auth actions (login, loginWithEmail, registerWithEmail) to avoid
  // duplicate sync calls -- the caller handles sync explicitly.
  const suppressNextBackgroundSyncRef = useRef(false);
  const syncInFlightRef = useRef<Promise<{ status: SyncStatus }> | null>(null);

  const syncAccount = async (options?: { firstName?: string; lastName?: string }) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user to sync');
    }

    if (syncInFlightRef.current) {
      return syncInFlightRef.current;
    }

    setAuthSyncState('syncing');
    const syncPromise = AuthService.sync(options)
      .then((result) => {
        setAuthSyncState('ready');
        return result;
      })
      .catch((err) => {
        setAuthSyncState('error');
        throw err;
      })
      .finally(() => {
        syncInFlightRef.current = null;
      });

    syncInFlightRef.current = syncPromise;
    return syncPromise;
  };

  /**
   * Sets up a Firebase auth state listener that:
   * - Updates the user state when auth state changes
   * - Reloads user data to ensure it's fresh
   * - Fires a background /auth/sync to ensure Firestore profile exists
   * - Handles initial loading state
   * Returns cleanup function to unsubscribe when component unmounts
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await firebaseUser.reload();
        setUser(firebaseUser);
        setAuthSyncState('syncing');

        // Fire-and-forget background sync -- ensures Firestore profile exists.
        // Non-blocking: does not delay app rendering or impact perceived load time.
        // Suppressed for one cycle after explicit auth actions to avoid duplicate calls.
        if (suppressNextBackgroundSyncRef.current) {
          suppressNextBackgroundSyncRef.current = false;
          setAuthSyncState((prev) => (prev === 'ready' ? 'ready' : 'idle'));
        } else {
          syncAccount().catch((err) => {
            logError('Background auth sync failed:', err);
          });
        }
      } else {
        setUser(null);
        setAuthSyncState('idle');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Handles Google Sign-In authentication
   * @returns Object containing:
   * - user: Authenticated Firebase user
   * - token: JWT token for API calls
   */
  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      suppressNextBackgroundSyncRef.current = true;
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      return { user: result.user, token };
    } catch (error) {
      suppressNextBackgroundSyncRef.current = false;
      logError('Authentication failed:', error);
      throw error;
    }
  };

  /**
   * Signs out the current user and clears auth state
   * Redirects to sign-in page handled by route protection
   */
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthSyncState('idle');
    } catch (error) {
      logError('Logout failed:', error);
    }
  };

  /**
   * Creates new user account with email/password.
   * Sets default profile picture client-side; display name is set
   * server-side by /auth/sync to avoid dual-write divergence.
   * @param email - User's email
   * @param password - User's password
   * @param firstName - User's first name (passed through, not used here)
   * @param lastName - User's last name (passed through, not used here)
   * @returns Object containing authenticated user and JWT token
   */
  const registerWithEmail = async (
    email: string,
    password: string,
    _firstName: string,
    _lastName: string
  ) => {
    try {
      suppressNextBackgroundSyncRef.current = true;
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Set default profile picture only -- display name is set server-side by /auth/sync
      await updateProfile(result.user, {
        photoURL: DEFAULT_PROFILE_PICTURE
      });
      const token = await result.user.getIdToken();
      return { user: result.user, token };
    } catch (error) {
      suppressNextBackgroundSyncRef.current = false;
      logError('Registration failed:', error);
      throw error;
    }
  };

  /**
   * Authenticates existing user with email/password
   * @param email - User's email
   * @param password - User's password
   * @returns Object containing authenticated user and JWT token
   */
  const loginWithEmail = async (email: string, password: string) => {
    try {
      suppressNextBackgroundSyncRef.current = true;
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      return { user: result.user, token };
    } catch (error) {
      suppressNextBackgroundSyncRef.current = false;
      logError('Email login failed:', error);
      throw error;
    }
  };

  /**
   * Sends email verification to currently signed-in user
   * Includes configuration for redirect URL after verification
   * @returns Promise<boolean> - True if email sent successfully
   * @throws Error if too many requests or other issues
   */
  const sendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    if (auth.currentUser.emailVerified) {
      throw new Error('Email is already verified');
    }

    try {
      const actionCodeSettings = {
        url: import.meta.env.VITE_EMAIL_VERIFICATION_REDIRECT_URL || window.location.origin,
        handleCodeInApp: true,
      };

      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Please wait a few minutes before requesting another verification email.');
      }
      // Handle other Firebase auth errors
      const errorMessage = error.message || 'Failed to send verification email';
      throw new Error(errorMessage);
    }
  };

  /**
   * Sends password reset email to specified address
   * Includes configuration for redirect URL after reset
   * @param email - Email address to send reset link to
   */
  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    try {
      await firebaseSendPasswordResetEmail(auth, email, {
        url: import.meta.env.VITE_PASSWORD_RESET_REDIRECT_URL || window.location.origin
      });
    } catch (error) {
      logError('Error sending password reset email:', error);
      throw error;
    }
  };

  /**
   * Updates the display name of the currently signed-in user
   * @param newName - The new display name to set
   */
  const updateDisplayName = async (newName: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    } catch (error) {
      logError('Error updating display name:', error);
      throw error;
    }
  };

  /**
   * Updates the user's email address after re-authentication
   * Sends verification email to new address; email only changes after verification
   * @param newEmail - The new email address
   * @param currentPassword - User's current password for re-authentication
   */
  const updateEmail = async (newEmail: string, currentPassword: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    if (!auth.currentUser.email) {
      throw new Error('Current user has no email address');
    }

    try {
      // Create credential for re-authentication
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      // Re-authenticate the user
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Send verification to new email
      const actionCodeSettings = {
        url: import.meta.env.VITE_EMAIL_VERIFICATION_REDIRECT_URL || window.location.origin,
        handleCodeInApp: true,
      };

      await verifyBeforeUpdateEmail(auth.currentUser, newEmail, actionCodeSettings);
    } catch (error) {
      logError('Error updating email:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: 'calc(var(--app-vh, 1vh) * 100)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(ellipse at 20% 20%, ${COLORS.PRIMARY_LIGHTEST} 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, ${COLORS.PRIMARY_LIGHTEST} 0%, transparent 50%),
            radial-gradient(ellipse at 60% 10%, ${COLORS.PRIMARY_LIGHTEST} 0%, transparent 40%),
            ${COLORS.NEUTRAL_LIGHT_GRAY}
          `,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Icon name="cardzen-logo" variant="solid" size={48} color={COLORS.PRIMARY_COLOR} />
          <LOADING_ICON size={24} className="spinning" aria-label="Loading" />
        </div>
      </div>
    );
  }

  const refreshUser = async (): Promise<void> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithEmail,
    registerWithEmail,
    syncAccount,
    authSyncState,
    logout,
    sendVerificationEmail,
    sendPasswordResetEmail,
    updateDisplayName,
    updateEmail,
    refreshUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
