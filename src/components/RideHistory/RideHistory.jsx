import { useState, useEffect } from "react";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { toast } from "react-toastify";
import "./RideHistory.css";
import { useSelector } from "react-redux";
import { selectIsDriverAuthenticated } from "../../features/driver/driverSlice";

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector(selectIsDriverAuthenticated);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axiosInstanceDriver.get("/api/driver/history", {
        withCredentials: true,
      });
      if (response.data.success) {
        setRides(response.data.rides);
      } else {
        toast.error(response.data.message || "Failed to fetch ride history");
      }
    } catch (error) {
      console.error("Error fetching ride history:", error.response?.data || error.message);
      toast.error("Error fetching ride history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  return (
    <div className="history-page">
      <h2>Ride History</h2>
      {loading ? (
        <p>Loading ride history...</p>
      ) : rides.length === 0 ? (
        <p>No rides found.</p>
      ) : (
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Fare</th>
                <th>Status</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride._id}>
                  <td>{new Date(ride.selectedDate).toLocaleString()}</td>
                  <td>{ride.pickup}</td>
                  <td>{ride.destination}</td>
                  <td>{ride.currency} {ride.price.toFixed(2)}</td>
                  <td>{ride.status}</td>
                  <td>{ride.rating ? ride.rating.toFixed(1) : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RideHistory;