import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import type { SocialButtonsProps } from "../types/auth";

export const SocialButtons = ({ onClick }: SocialButtonsProps) => {
  return (
    <div className="flex justify-center gap-4">
      <button
        type="button"
        onClick={() => onClick("Google")}
        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
      >
        <FcGoogle size={20} />
      </button>

      <button
        type="button"
        onClick={() => onClick("Facebook")}
        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-blue-600"
      >
        <FaFacebook size={20} />
      </button>
    </div>
  );
};
