import { useEffect } from "react";
import { io } from "socket.io-client";
import PropTypes from "prop-types";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  auth: {
    driverId: Number(localStorage.getItem("driverId")),
  },
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 500,
});
const DriverSocketProvider = ({ children }) => {
  /*
  useEffect(() => {
    const driverId = localStorage.getItem("driverId");

    if (!driverId) return console.warn("❌ Missing driverId");

    socket.emit("joinDriverRoom", driverId);
    console.log(`✅ Driver ${driverId} joined room`);

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("joinDriverRoom", driverId);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    // ✅ Emit live location every few seconds
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        socket.emit("driverLocationUpdate", { driverId, latitude, longitude });
        console.log("📡 Sent location:", latitude, longitude);
      },
      (err) => console.error("❌ Location error:", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.offAny();
    };
  }, []);

  return <>{children}</>;
  */
};

DriverSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { socket };
export default DriverSocketProvider;
