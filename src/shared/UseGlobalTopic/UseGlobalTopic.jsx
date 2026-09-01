// src/shared/hooks/useGlobalTopic.js
import { useEffect } from "react";
import axiosInstance from "../../../axiosInstance";

export function useGlobalTopic(token) {
  useEffect(() => {
    if (!token) return;
    axiosInstance
      .post(
        "/api/user/subscribe-global",
        { fcmToken: token },
        { withCredentials: true }
      )
      .then(() => console.log("✅ Subscribed to global‑updates"))
      .catch(err => console.error("Global topic subscribe error:", err));
  }, [token]);
}
