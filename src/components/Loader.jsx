import React from "react";

const Loader = ({ size = "3.25em", className = "" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      {/* Inline styles for SVG animation */}
      <style>
        {`
          @keyframes rotate4 {
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes dash4 {
            0% {
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 90, 200;
              stroke-dashoffset: -35px;
            }
            100% {
              stroke-dashoffset: -125px;
            }
          }
        `}
      </style>

      <svg
        viewBox="25 25 50 50"
        style={{
          width: size,
          animation: "rotate4 2s linear infinite",
          transformOrigin: "center",
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke="hsl(214, 97%, 59%)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray: "1, 200",
            strokeDashoffset: 0,
            animation: "dash4 1.5s ease-in-out infinite",
          }}
        />
      </svg>
    </div>
  );
};

export default Loader;
