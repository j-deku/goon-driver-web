import React, { useState } from "react";
import { MdNotifications } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import "./DriverNotifications.css";
import { clearNotifications, selectDriverNotifications } from "../../features/driver/driverNotificationsSlice";

const DriverNotifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectDriverNotifications);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
  };

  return (
    <div className="driver-notifications">
      <div className="notification-icon" onClick={toggleDropdown}>
        <MdNotifications size={30} style={{ color: "#fff", cursor: "pointer" }} />
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </div>
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notifications</span>
            <button onClick={handleClearNotifications} className="clear-btn">
              Clear
            </button>
          </div>
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map((notif, index) => (
              <div key={index} className="notification-item">
                <p>{notif.message}</p>
                <span>{new Date(notif.createdAt).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DriverNotifications;