import { useEffect, useState } from "react";
import {
  lightning,
  calander,
  presentation,
  ticket,
  street,
  confetti,
  banner,
} from "../../assets";

const logos = [
  lightning,
  calander,
  presentation,
  ticket,
  street,
  confetti,
  banner,
];

interface LoaderProps {
  durationPerLogo?: number;
  iterations?: number;
  onFinish?: () => void;
}

const Loader: React.FC<LoaderProps> = ({
  durationPerLogo = 1000,
  iterations = 1,
  onFinish,
}) => {
  const extendedLogos = Array(iterations).fill(logos).flat();
  const totalDuration = durationPerLogo * extendedLogos.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % extendedLogos.length);
    }, durationPerLogo);

    const timeout = setTimeout(() => {
      onFinish?.();
    }, totalDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentIndex, durationPerLogo, extendedLogos.length, onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 animate-gradient-x"></div>
      <div className="relative w-48 h-48 ml-16">
        {extendedLogos.map((logo, index) => {
          let className =
            "absolute top-1/2 -translate-y-1/2 w-12 h-12 object-contain transition-all duration-700 ease-in-out pl-2";

          if (index === currentIndex) {
            className +=
              " translate-x-0 opacity-100 scale-110 rotate-0 animate-bounce-slow";
          } else if (index === prevIndex) {
            className += " -translate-x-full opacity-0 scale-100 rotate-0";
          } else {
            className += " translate-x-full opacity-0 scale-100 rotate-0";
          }

          return (
            <img
              key={index}
              src={logo}
              alt={`logo-${index}`}
              className={className}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Loader;
