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
  //getAuth,
  //UserCredential
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { PLACEHOLDER_PROFILE_IMAGE } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  login: () => Promise<{ user: FirebaseUser; token: string; isNewUser: boolean }>;
  loginWithEmail: (email: string, password: string) => Promise<{ user: FirebaseUser; token: string }>;
  registerWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<{ user: FirebaseUser; token: string }>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
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
      const isNewUser = (result as any)._tokenResponse.isNewUser;
      const token = await user.getIdToken();
      return { user, token, isNewUser };
    } catch (error) {
      console.error('Authentication failed:', error);
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
      console.error('Logout failed:', error);
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
      console.error('Registration failed:', error);
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
      console.error('Email login failed:', error);
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
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const value: AuthContextType = {
    user,
    login,
    loginWithEmail,
    registerWithEmail,
    logout,
    sendVerificationEmail,
    sendPasswordResetEmail,
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