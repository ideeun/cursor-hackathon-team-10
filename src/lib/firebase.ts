import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCPq4FzAw5dSlTKaiH4-75mePRKrP1Kch0",
  authDomain: "cursor-1782d.firebaseapp.com",
  projectId: "cursor-1782d",
  storageBucket: "cursor-1782d.firebasestorage.app",
  messagingSenderId: "386229270678",
  appId: "1:386229270678:web:6ee4c6b1f2b5e549496ab7",
  measurementId: "G-0QBMVC6FYY",
};

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export async function initAnalytics() {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
}
