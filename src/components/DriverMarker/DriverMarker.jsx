import React from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import useDriverHeading from "../../hooks/DriverHook/UseDriverHeading/UseDriverHeading";
import useSmoothedPosition from "../../hooks/DriverHook/UseSmoothedPosition/UseSmoothedPosition";

const DriverMarker = ({ position, isMoving: isMovingProp }) => {
  const smoothed = useSmoothedPosition(position, 800);
  const { heading, isMoving } = useDriverHeading(position);
  const DriverIcon = import.meta.env.VITE_DRIVER_CAR_ICON;

  if (!smoothed) return null;

  const moving = isMovingProp ?? isMoving;

  return (
    <AdvancedMarker position={smoothed} title="Your current location" zIndex={1000}>
      <div className="driver-marker">
        <div className={`driver-marker__pulse ${moving ? "is-moving" : ""}`} />
        <div
          className="driver-marker__icon"
          style={{ transform: `rotate(${heading}deg)` }}
        >
          <img src={DriverIcon} alt="" draggable={false} />
        </div>
      </div>
    </AdvancedMarker>
  );
};

export default DriverMarker;