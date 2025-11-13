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
  linkWithCredential,
  fetchSignInMethodsForEmail,
  OAuthProvider,
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
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Bạn đã đóng cửa sổ đăng nhập');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore - user opened multiple popups
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      }
      
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    provider.addScope('public_profile');
    
    try {
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUser(result.user);
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      console.error('Error signing in with Facebook:', error);
      
      // Handle account exists with different credential
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        
        // Tìm phương thức đăng nhập đã tồn tại
        if (email) {
          try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            const providerName = methods[0]?.includes('google') ? 'Google' : 
                                methods[0]?.includes('facebook') ? 'Facebook' : 
                                'Email/Password';
            
            toast.error(
              `Email này đã được dùng với ${providerName}.\nVui lòng đăng nhập bằng ${providerName}!`,
              { duration: 5000 }
            );
          } catch (err) {
            toast.error('Email này đã được sử dụng với phương thức khác!');
          }
        } else {
          toast.error('Email này đã được sử dụng. Vui lòng thử phương thức khác!');
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Bạn đã đóng cửa sổ đăng nhập');
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      }
      
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      const errorMessage = error.code === 'auth/user-not-found' 
        ? 'Tài khoản không tồn tại'
        : error.code === 'auth/wrong-password'
        ? 'Mật khẩu không đúng'
        : error.code === 'auth/invalid-email'
        ? 'Email không hợp lệ'
        : 'Đăng nhập thất bại';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Create user in database
      await createOrUpdateUser(result.user, displayName);
      
      toast.success('Đăng ký thành công!');
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
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: customDisplayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL,
        }),
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
