import React from "react";

export default function DottedOverlay({
  className = "",
  opacity = "opacity-60",
  dotColor = "rgba(161, 172, 199, 0.55)",
  size = "25px",
}) {
  return (
    <div
      className={`absolute inset-0 z-0 pointer-events-none rounded-[40px] overflow-hidden ${opacity} ${className}`}
      style={{
        backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: `${size} ${size}`,
      }}
    />
  );
}
