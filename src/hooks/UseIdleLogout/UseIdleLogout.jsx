import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { driverLogout } from "../../features/driver/driverSlice";

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export default function useIdleLogout(isAuthenticated) {
  const dispatch = useDispatch();
  const timeoutRef = useRef();

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dispatch(driverLogout());
      }, IDLE_TIMEOUT);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [dispatch, isAuthenticated]);
}