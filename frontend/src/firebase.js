// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx68weo9Br0WqSvt3egD_ApzlY_UZ7h78",
  authDomain: "glamconnect-259ae.firebaseapp.com",
  projectId: "glamconnect-259ae",
  storageBucket: "glamconnect-259ae.firebasestorage.app",
  messagingSenderId: "1051476756229",
  appId: "1:1051476756229:web:c33cfafcc0d58f77c6596c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function sendVerificationToUser(user) {
  if (!user) throw new Error('Firebase user required');
  try {
    await sendEmailVerification(user, {
      url: window.location.origin + '/auth?verified=1'
    });
    return { success: true };
  } catch (err) {
    console.error('Failed to send verification email', err);
    return { success: false, message: err.message || 'Failed to send verification email' };
  }
}

export async function sendPasswordReset(email) {
  if (!email) throw new Error('Email required');
  try {
    await sendPasswordResetEmail(auth, email, { url: window.location.origin + '/auth' });
    return { success: true };
  } catch (err) {
    console.error('Failed to send password reset email', err);
    return { success: false, message: err.message || 'Failed to send password reset email' };
  }
}

export { auth, firebaseConfig };
export default app;
