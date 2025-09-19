import { lightning } from "@/assets";

const Logo = ({ size = 18 }: { size?: number }) => (
  <img
    src={lightning}
    alt="lightning"
    width={size}
    height={size}
    style={{ display: "inline-block" }}
  />
);

export default Logo;
