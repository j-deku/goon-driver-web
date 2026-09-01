import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./DriverProfile.css";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { useSelector } from "react-redux";
import { selectIsDriverAuthenticated } from "../../features/driver/driverSlice";

const DriverProfile = () => {
  const isAuthenticated = useSelector(selectIsDriverAuthenticated);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    availability: true,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);

const fetchProfile = async () => {
  setLoading(true);
  try {
    const response = await axiosInstanceDriver.post("/api/driver/profile", {
      withCredentials: true,
    });
    if (response.data.success) {
      const data = response.data.driverProfile;
      setProfile({
        name: data.user?.name || "",
        email: data.user?.email || "",
        phone: data.phone || "",
        availability: data.availability ?? true,
      });
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    toast.error("Failed to fetch profile");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Handle boolean for availability select
    const val =
      type === "select-one" && name === "availability"
        ? value === "true"
        : value;
    setProfile((prev) => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(profile).forEach((key) => {
      formData.append(key, profile[key]);
    });
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    try {
      const response = await axiosInstanceDriver.post(
        "/api/driver/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Profile updated successfully");
        setProfile(response.data.driverProfile); // Optionally update with returned data
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="driver-profile">
      <h3>Update Your Profile</h3>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={profile.name || ""} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={profile.email || ""} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" value={profile.phone || ""} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Availability</label>
          <select name="availability" value={String(profile.availability)} onChange={handleChange}>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
        <div className="form-group">
          <label>Update Avatar (optional)</label>
          <input type="file" name="avatar" onChange={handleFileChange} accept="image/*" />
        </div>
        <button type="submit" className="btn-update">Update Profile</button>
      </form>
    </div>
  );
};

export default DriverProfile;