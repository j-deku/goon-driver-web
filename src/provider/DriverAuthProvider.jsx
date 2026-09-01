import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsDriverAuthenticated,
  selectDriverAuthChecked,
  selectDriverLoading,
  driverLogout,
  fetchDriverInfo,
} from "../features/driver/driverSlice";
import useIdleLogout from "../hooks/UseIdleLogout/UseIdleLogout";
import { emitter } from "../../axiosInstanceDriver";

// Context Setup
export const DriverAuthContext = createContext();
export function useDriverAuth() {
  return useContext(DriverAuthContext);
}

export default function DriverAuthProvider({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsDriverAuthenticated);
  const authChecked = useSelector(selectDriverAuthChecked);
  const isLoading = useSelector(selectDriverLoading);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Only fetch driver info if not checked yet or if we need to revalidate
  useEffect(() => {
    // Prevent unnecessary API calls - only fetch if we haven't checked yet
    if (!authChecked && !isLoading) {
      console.log('Initial driver info fetch - authChecked:', authChecked, 'isLoading:', isLoading);
      dispatch(fetchDriverInfo());
    }
  }, [dispatch, authChecked, isLoading]);

  // Handle idle logout
  useIdleLogout(isAuthenticated);

  // Listen for forced session expiration via event emitter
  useEffect(() => {
    const handleSessionExpired = () => {
      if (!sessionExpired) {
        setSessionExpired(true);
        dispatch(driverLogout());
      }
    };

    emitter.on("sessionExpired", handleSessionExpired);
    return () => emitter.off("sessionExpired", handleSessionExpired);
  }, [dispatch, sessionExpired]);

  // Memoize context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      isAuthenticated,
      authChecked,
      isLoading,
      sessionExpired,
    }),
    [isAuthenticated, authChecked, isLoading, sessionExpired]
  );

  return (
    <DriverAuthContext.Provider value={value}>
      {children}
    </DriverAuthContext.Provider>
  );
}