/**
 * FoodHunt — Firebase Client SDK
 * Handles Firebase Auth (Phone OTP, Google, Apple Sign-In)
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  type ConfirmationResult,
  type Auth,
} from 'firebase/auth';

// ─── Firebase Config ──────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyD--RO-LzrC2BPzYUpEdYMWIZP5h3S_43Q",
  authDomain: "foodhunt-925ba.firebaseapp.com",
  projectId: "foodhunt-925ba",
  storageBucket: "foodhunt-925ba.firebasestorage.app",
  messagingSenderId: "52114869520",
  appId: "1:52114869520:web:aefaf1b0e62cead4f16995",
  measurementId: "G-0ZZHHFYGNR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

// Set language to Turkish
auth.languageCode = 'tr';

// ─── Phone OTP ────────────────────────────────────────────────────────────
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/**
 * Initialize invisible reCAPTCHA for phone auth
 * Must be called before sendOTP, attaches to a DOM element
 */
export function initRecaptcha(buttonId: string): void {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved — will proceed with phone sign-in
    },
  });
}

/**
 * Send OTP SMS to the given phone number
 * Phone must be in E.164 format: +905551234567
 */
export async function sendOTP(phoneNumber: string): Promise<void> {
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA henüz hazır değil');
  }
  // Ensure phone is in E.164 format for Turkey
  const formatted = formatTurkishPhone(phoneNumber);
  confirmationResult = await signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
}

/**
 * Verify the OTP code the user received via SMS
 * Returns Firebase ID token for backend verification
 */
export async function verifyOTP(code: string): Promise<string> {
  if (!confirmationResult) {
    throw new Error('Önce SMS kodu gönderilmeli');
  }
  const result = await confirmationResult.confirm(code);
  const idToken = await result.user.getIdToken();
  return idToken;
}

// ─── Google Sign-In ───────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

/**
 * Sign in with Google popup
 * Returns Firebase ID token for backend verification
 */
export async function signInWithGoogle(): Promise<string> {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return idToken;
}

// ─── Apple Sign-In ────────────────────────────────────────────────────────
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

/**
 * Sign in with Apple popup
 * Returns Firebase ID token for backend verification
 */
export async function signInWithApple(): Promise<string> {
  const result = await signInWithPopup(auth, appleProvider);
  const idToken = await result.user.getIdToken();
  return idToken;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

// ─── Get Current User Token ───────────────────────────────────────────────
export async function getCurrentToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// ─── Utility: Format Turkish phone number to E.164 ────────────────────────
export function formatTurkishPhone(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Handle various Turkish formats:
  // 05551234567 → +905551234567
  // 5551234567  → +905551234567
  // 905551234567 → +905551234567
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  if (!digits.startsWith('90')) {
    digits = '90' + digits;
  }
  return '+' + digits;
}

/**
 * Validate Turkish phone number format
 */
export function isValidTurkishPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Turkish mobile: 5XX XXX XXXX (10 digits without country code)
  if (digits.startsWith('0')) {
    return digits.length === 11 && digits[1] === '5';
  }
  if (digits.startsWith('90')) {
    return digits.length === 12 && digits[2] === '5';
  }
  return digits.length === 10 && digits[0] === '5';
}

export { auth };
