import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext(null);

const DEFAULT_PROFILE_PICTURE = 'http://localhost:3000/account.png';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          email: user.email,
          name: user.displayName,
          picture: user.photoURL || DEFAULT_PROFILE_PICTURE, // Use default picture if no photo provided
          uid: user.uid
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithEmail, 
      registerWithEmail, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 