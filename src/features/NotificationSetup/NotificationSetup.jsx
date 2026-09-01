/* eslint-disable no-unused-vars */
// src/shared/components/NotificationSetup.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, useTheme
} from "@mui/material";
import { onMessage, deleteToken } from "firebase/messaging";
import { Howl } from "howler";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { selectUserId } from "../../features/user/userSlice";
import axiosInstance from "../../../axiosInstance";
import { useGlobalTopic } from "../../shared/UseGlobalTopic/UseGlobalTopic";
import { getMessagingInstance } from "../../user/firebase/firebaseConfig";
import { syncFcmToken } from "../../shared/firebase/syncFcmToken";

export default function NotificationSetup() {
  const theme = useTheme();
  const userId = useSelector(selectUserId);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg,  setModalMsg]  = useState("");
  const [fcmToken, setFcmToken]  = useState(null);

  const alertSoundRef = useRef(null);
  if (!alertSoundRef.current) {
    alertSoundRef.current = new Howl({ src: ["/sounds/bubble-pop.mp3"] });
  }

  // 1) Ask permission, subscribe PushManager, sync token
  const initPush = useCallback(async () => {
    if (!userId) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push not supported in this browser");
      return;
    }
    if (Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setModalMsg("Please enable notifications in your browser settings.");
        setModalOpen(true);
        return;
      }
    }
    const reg = await navigator.serviceWorker.ready;
    await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_FIREBASE_VAPID_KEY),
    });
    const token = await syncFcmToken();
    setFcmToken(token);
  }, [userId]);

  // 2) Call hook to subscribe to the "global-updates" topic
  useGlobalTopic(fcmToken);

  // 3) Listen for foreground messages
  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    (async () => {
      const messaging = await getMessagingInstance();
      if (!messaging || cancelled) return;

      await initPush();

      unsubscribe = onMessage(messaging, payload => {
        alertSoundRef.current.play();
        toast.info(
          <>
            <strong>{payload.notification?.title}</strong><br/>
            {payload.notification?.body}
          </>
        );
      });
    })();

    window.addEventListener("focus", syncFcmToken);
    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("focus", syncFcmToken);
    };
  }, [initPush]);

  // 🚪 Unsubscribe on logout
  useEffect(() => {
    if (!userId) {
      (async () => {
        try {
          const token = localStorage.getItem("fcmToken");
          if (token) {
            const messaging = await getMessagingInstance();
            if (messaging) await deleteToken(messaging);
            await axiosInstance.post(
              "/api/user/remove-token",
              { fcmToken: token },
              { withCredentials: true }
            );
            localStorage.removeItem("fcmToken");
            console.log("🔕 Unsubscribed FCM on logout");
          }
        } catch (err) {
          //
        }
      })();
    }
  }, [userId]);

  return (
    <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
      <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: "#fff" }}>
        Notifications
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{modalMsg}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => window.open(
            "https://support.google.com/chrome/answer/3220216",
            "_blank"
          )}
          sx={{ color: theme.palette.primary.main }}
        >
          Learn How
        </Button>
        <Button onClick={() => setModalOpen(false)} sx={{ color: theme.palette.primary.main }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Utility to decode VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}