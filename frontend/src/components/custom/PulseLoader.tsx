import React from "react";

interface PulseLoaderProps {
  show: boolean;
}

const PulseLoader: React.FC<PulseLoaderProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[0px] flex items-center justify-center z-50">
      <svg
        className="animate-pulse"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 512"
        width="200"
        height="200"
      >
        <path
          d="M216 160h-92l36-128-120 192h92l-36 160 120-224h-92z"
          fill="black"
        />
      </svg>
    </div>
  );
};

export default PulseLoader;
