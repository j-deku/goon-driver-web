import React from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";


const RideRequestMarker = ({ request, isSelected, onSelect }) => {
  return (
    <AdvancedMarker
      position={request.pickup}
      title={`Booking request · $${request.estFare}`}
      zIndex={isSelected ? 900 : 500}
      onClick={() => onSelect(request.requestId)}
    >
      <div className={`ride-pin ${isSelected ? "is-selected" : ""}`}>
        <div className="ride-pin__fare">${request.estFare}</div>
        <div className="ride-pin__stem" />
      </div>
    </AdvancedMarker>
  );
};

export default RideRequestMarker;