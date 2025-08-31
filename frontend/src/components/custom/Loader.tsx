import { useEffect, useState } from "react";

interface LoaderProps {
  auto?: boolean;         
  fill?: boolean;          
  onFinish?: () => void;   
}

const Loader: React.FC<LoaderProps> = ({ auto = true, fill = false, onFinish }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (fill) {
      setProgress(100);
      return;
    }

    if (auto) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 20);

      return () => clearInterval(interval);
    }
  }, [auto, fill]);

  useEffect(() => {
    if (progress === 100 && onFinish) {
      const timeout = setTimeout(onFinish, 3000); 
      return () => clearTimeout(timeout);
    }
  }, [progress, onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200 text-black">
      <svg
        className={`${progress === 100 ? "animate-pulse" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 512"
        width="200"
        height="200"
      >
        <path
          d="M216 160h-92l36-128-120 192h92l-36 160 120-224h-92z"
          fill="rgb(0, 0, 0)"
          style={{
            clipPath: `inset(${100 - progress}% 0 0 0)`,
            transition: "clip-path 0.2s linear",
          }}
        />
      </svg>
    </div>
  );
};

export default Loader;
