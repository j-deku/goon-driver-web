import { useState, useEffect } from 'react';
import axiosInstanceDriver from '../../../axiosInstanceDriver';
export function UseCommissionRate() {
  const [rate, setRate] = useState(0); // default to 0
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await axiosInstanceDriver.get("/api/driver/commission-rate", {
          withCredentials: true,
        });
        if (!isMounted) return;
        const parsed = parseFloat(data.rate);
        setRate(!isNaN(parsed) ? parsed : 0);
      } catch (err) {
        console.error("Failed to load commission rate:", err);
        if (isMounted) setRate(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return { rate, loading };
}
