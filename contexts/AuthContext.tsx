'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithPhone: async () => ({} as ConfirmationResult),
  verifyPhoneCode: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data from our database
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUserData(data.user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUser(result.user);
    } catch (error: any) {
      // Ignore user cancellation errors silently
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/cancelled-popup-request' ||
          error.code === 'auth/user-cancelled') {
        return;
      }
      
      // Only log real errors
      console.error('Error signing in with Google:', error);
      toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    provider.addScope('public_profile');
    
    try {
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUser(result.user);
    } catch (error: any) {
      // Ignore user cancellation errors silently
      if (error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/user-cancelled') {
        return;
      }
      
      // Only log real errors
      console.error('Error signing in with Facebook:', error);
      toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const errorMessage = error.code === 'auth/user-not-found' 
        ? 'Tài khoản không tồn tại'
        : error.code === 'auth/wrong-password'
        ? 'Mật khẩu không đúng'
        : error.code === 'auth/invalid-credential'
        ? 'Email hoặc mật khẩu không đúng'
        : error.code === 'auth/invalid-email'
        ? 'Email không hợp lệ'
        : error.code === 'auth/too-many-requests'
        ? 'Quá nhiều lần thử. Vui lòng thử lại sau'
        : 'Đăng nhập thất bại';
      toast.error(errorMessage);
      // Throw simple error thay vì FirebaseError để không hiện lỗi đỏ
      throw new Error(errorMessage);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Create user in database
      await createOrUpdateUser(result.user, displayName);
      
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'Email đã được sử dụng'
        : error.code === 'auth/weak-password'
        ? 'Mật khẩu quá yếu (tối thiểu 6 ký tự)'
        : error.code === 'auth/invalid-email'
        ? 'Email không hợp lệ'
        : 'Đăng ký thất bại';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      // Setup reCAPTCHA
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: () => {
              // reCAPTCHA solved
            }
          }
        );
      }
      
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      toast.success('Mã OTP đã được gửi!');
      return confirmationResult;
    } catch (error: any) {
      console.error('Error signing in with phone:', error);
      toast.error('Gửi OTP thất bại');
      throw error;
    }
  };

  const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string) => {
    try {
      const result = await confirmationResult.confirm(code);
      await createOrUpdateUser(result.user);
      toast.success('Xác thực thành công!');
    } catch (error: any) {
      console.error('Error verifying phone code:', error);
      toast.error('Mã OTP không đúng');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      const errorMessage = error.code === 'auth/user-not-found'
        ? 'Email không tồn tại'
        : 'Gửi email thất bại';
      toast.error(errorMessage);
      throw error;
    }
  };

  const createOrUpdateUser = async (firebaseUser: FirebaseUser, customDisplayName?: string) => {
    try {
      // Check if user already exists first
      const token = await firebaseUser.getIdToken();
      const checkResponse = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const payload: any = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: customDisplayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
      };
      
      // Only set photoURL if user doesn't exist or doesn't have a custom photo
      if (!checkResponse.ok) {
        // New user - use Firebase photo
        payload.photoURL = firebaseUser.photoURL;
      }
      // For existing users, don't send photoURL - keep their custom uploaded photo
      
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error creating/updating user:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhone,
    verifyPhoneCode,
    resetPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
