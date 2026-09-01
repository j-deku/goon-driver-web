import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { toast } from "react-toastify";
import "./EditFare.css";

const EditFare = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [newFare, setNewFare] = useState("");

  // Fetch ride details for the given rideId
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await axiosInstanceDriver.get(`/api/driver/rides/${rideId}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setRide(response.data.ride);
          setNewFare(response.data.ride.price);
        } else {
          toast.error(response.data.message || "Ride not found");
        }
      } catch (error) {
        console.error("Error fetching ride:", error.response?.data || error.message);
        toast.error("Error fetching ride details");
      }
    };
    fetchRide();
  }, [rideId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newFare <= 0) {
      toast.error("Please enter a valid fare.");
      return;
    }
    try {
      const response = await axiosInstanceDriver.put(
        "/api/driver/ride/fare",
        { rideId, newFare },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/dashboard");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating fare:", error.response?.data || error.message);
      toast.error("Error updating fare");
    }
  };

  if (!ride) {
    return <p>Loading ride details...</p>;
  }

  return (
    <div className="edit-fare">
      <h2>Edit Fare for Ride</h2>
      <p>
        {ride.pickup} &rarr; {ride.destination}
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Fare:</label>
          <input
            type="number"
            value={newFare}
            onChange={(e) => setNewFare(Number(e.target.value))}
          />
        </div>
        <button type="submit">Update Fare</button>
      </form>
    </div>
  );
};

export default EditFare;