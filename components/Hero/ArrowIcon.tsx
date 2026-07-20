"use client";

interface ArrowIconProps {
  size?: number;
  color?: string;
}

export default function ArrowIcon({
  size = 22,
  color = "currentColor",
}: ArrowIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4 12H18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M12 6L18 12L12 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}