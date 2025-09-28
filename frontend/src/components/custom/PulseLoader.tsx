import React from "react";
import lightning from "@/assets/lightning.png"; // or your Logo component

interface PulseLoaderProps {
  show: boolean;
}

const PulseLoader: React.FC<PulseLoaderProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[0px]  flex items-center justify-center z-50">
      <img
        src={lightning}
        alt="logo"
        className="w-20 h-20 animate-pulse brightness-125 drop-shadow-lg"
      />
    </div>
  );
};

export default PulseLoader;
