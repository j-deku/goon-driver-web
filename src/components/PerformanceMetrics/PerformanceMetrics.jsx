import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./PerformanceMetrics.css";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { useSelector } from "react-redux";
import { selectIsDriverAuthenticated } from "../../features/driver/driverSlice";

const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector(selectIsDriverAuthenticated);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await axiosInstanceDriver.get("/api/driver/performance-metrics", {
        withCredentials: true,
      });
      if (response.data.success) {
        setMetrics(response.data.metrics);
      } else {
      //  toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching performance metrics:", error.response?.data || error.message);
     // toast.error("Failed to fetch performance metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <p>Loading performance metrics...</p>;
  }

  return (
    <div className="performance-metrics">
      <h2>Performance Metrics</h2>
      {metrics ? (
        <div className="metrics-details">
          <p>
            <strong>Total Completed Rides:</strong> {metrics.totalCompleted}
          </p>
          <p>
            <strong>Average Fare per Ride:</strong> ${metrics.averageFare?.toFixed(2)}
          </p>
          <p>
            <strong>Average Ride Duration:</strong>{" "}
            {metrics.averageDuration !== null && metrics.averageDuration !== undefined
              ? `${metrics.averageDuration.toFixed(2)} minutes`
              : "N/A"}
          </p>
        </div>
      ) : (
        <p>No performance data available.</p>
      )}
    </div>
  );
};

export default PerformanceMetrics;