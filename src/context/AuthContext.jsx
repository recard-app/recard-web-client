import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  getAuth,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';

const AuthContext = createContext(null);

const DEFAULT_PROFILE_PICTURE = 'http://localhost:5173/account.png';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Refresh the user object to get the latest data
        await user.reload(); // Ensure the user object is refreshed
        setUser({
          email: user.email,
          name: user.displayName,
          picture: user.photoURL || DEFAULT_PROFILE_PICTURE,
          uid: user.uid,
          emailVerified: user.emailVerified // Ensure this is included
        });
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
      // Check if this is a new user
      const isNewUser = result._tokenResponse.isNewUser;
      if (isNewUser) {
        console.log('First time sign in with Google!');
        // You can perform additional setup for new users here
      }
      // Get ID token for backend authentication
      const token = await user.getIdToken();
      return { user, token, isNewUser };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const registerWithEmail = async (email, password, firstName, lastName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update the user's display name with first and last name
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`
      });
      const token = await result.user.getIdToken();
      return { user: result.user, token };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      return { user: result.user, token };
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      try {
        // Add configuration for email verification
        const actionCodeSettings = {
          url: import.meta.env.VITE_EMAIL_VERIFICATION_REDIRECT_URL || window.location.origin,
          handleCodeInApp: true,
        };

        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        return true;
      } catch (error) {
        if (error.code === 'auth/too-many-requests') {
          throw new Error('Please wait a few minutes before requesting another verification email.');
        }
        console.error('Error sending verification email:', error);
        throw error;
      }
    }
  };

  const sendPasswordResetEmail = async (email) => {
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

  const value = {
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

export const useAuth = () => useContext(AuthContext); 