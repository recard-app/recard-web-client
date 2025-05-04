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
  getAuth,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  UserCredential
} from 'firebase/auth';

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

const DEFAULT_PROFILE_PICTURE = 'http://localhost:5173/account.png';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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

  const sendVerificationEmail = async (): Promise<boolean> => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      try {
        // Add configuration for email verification
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
        console.error('Error sending verification email:', error);
        throw error;
      }
    }
    return false;
  };

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 