// src/shared/firebase/syncFcmToken.js
import { getToken } from "firebase/messaging";
import axiosInstance from "../../../axiosInstance";
import { getMessagingInstance } from "../../user/firebase/firebaseConfig";

export async function syncFcmToken() {
  // 0) Bail out gracefully if messaging isn't supported here
  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.warn("FCM not supported in this environment — skipping sync");
    return null;
  }

  // 1) Wait for SW ready
  const registration = await navigator.serviceWorker.ready;

  // 2) Get token from FCM
  const token = await getToken(messaging, {
    serviceWorkerRegistration: registration,
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });
  if (!token) throw new Error("No FCM token available");

  // 3) Only re‑sync if it changed
  const prev = localStorage.getItem("fcmToken");
  if (token !== prev) {
    localStorage.setItem("fcmToken", token);
    await axiosInstance.post(
      "/api/user/update-token",
      { fcmToken: token },
      { withCredentials: true }
    );
    console.log("🔄 FCM token synced:", token);
  }

  return token;
}