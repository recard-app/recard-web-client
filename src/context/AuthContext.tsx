import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
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
  getAdditionalUserInfo,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { PLACEHOLDER_PROFILE_IMAGE, APP_NAME, PAGE_ICONS, LOADING_ICON, COLORS } from '../types';
import { logError } from '../utils/logger';

interface AuthContextType {
  user: FirebaseUser | null;
  login: () => Promise<{ user: FirebaseUser; token: string; isNewUser: boolean }>;
  loginWithEmail: (email: string, password: string) => Promise<{ user: FirebaseUser; token: string }>;
  registerWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<{ user: FirebaseUser; token: string }>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateDisplayName: (newName: string) => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_PROFILE_PICTURE = PLACEHOLDER_PROFILE_IMAGE;

/**
 * AuthProvider component handles Firebase authentication state and methods.
 * Provides authentication context to child components.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Sets up a Firebase auth state listener that:
   * - Updates the user state when auth state changes
   * - Reloads user data to ensure it's fresh
   * - Handles initial loading state
   * Returns cleanup function to unsubscribe when component unmounts
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await firebaseUser.reload();
        setUser(firebaseUser);
      } else {
        setUser(null);
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
   * - isNewUser: Boolean indicating if this is a new user
   */
  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser ?? false;
      const token = await user.getIdToken();
      return { user, token, isNewUser };
    } catch (error) {
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
    } catch (error) {
      logError('Logout failed:', error);
    }
  };

  /**
   * Creates new user account with email/password
   * Also sets up initial profile with name and default picture
   * @param email - User's email
   * @param password - User's password
   * @param firstName - User's first name
   * @param lastName - User's last name
   * @returns Object containing authenticated user and JWT token
   */
  const registerWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: DEFAULT_PROFILE_PICTURE
      });
      const token = await result.user.getIdToken();
      return { user: result.user, token };
    } catch (error) {
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      return { user: result.user, token };
    } catch (error) {
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
          minHeight: 'calc(var(--app-vh, 1vh) * 100)',
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
          <img src={PAGE_ICONS.LOGO} alt={`${APP_NAME} logo`} style={{ width: 48, height: 48 }} />
          <LOADING_ICON size={24} className="spinning" aria-label="Loading" />
        </div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    login,
    loginWithEmail,
    registerWithEmail,
    logout,
    sendVerificationEmail,
    sendPasswordResetEmail,
    updateDisplayName,
    updateEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access auth context
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType containing user state and auth methods
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 