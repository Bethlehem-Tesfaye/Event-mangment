
const Logo = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 512"
    fill="black"
    style={{ transform: "scaleX(1.3)" }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M216 160h-92l36-128-120 192h92l-36 160 120-224h-92z" />
  </svg>
);

export default Logo;
