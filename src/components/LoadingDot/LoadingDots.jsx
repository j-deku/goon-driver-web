// src/components/LoadingDots/LoadingDots.jsx
import React from "react";
import "./LoadingDots.css";

export default function LoadingDots({
  dotColor = "#007bff",    // default to a blue (you can override)
  dotSize = 12,            // diameter of each dot in pixels
  dotSpacing = 8,          // spacing between dots in pixels
  animationDuration = 1,   // one full cycle in seconds
  ariaLabel = "Loading"    // accessible label
}) {
  const dotStyle = {
    backgroundColor: dotColor,
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    margin: `0 ${dotSpacing / 2}px`,
  };

  return (
    <div className="loading-dots" role="status" aria-label={ariaLabel}>
      <span className="dot" style={dotStyle} />
      <span className="dot" style={dotStyle} />
      <span className="dot" style={dotStyle} />
      <style>
        {`
          /* Override animation duration via inline CSS variable */
          .loading-dots .dot {
            animation-duration: ${animationDuration}s;
          }
        `}
      </style>
    </div>
  );
}
