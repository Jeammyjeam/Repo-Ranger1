import type { SVGProps } from "react";

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>Repo Ranger Logo</title>
    <path d="m16 16-1.5-1.5" />
    <path d="M18 13v5" />
    <path d="M14 16h5" />
    <path d="M12 11.5A4.5 4.5 0 0 1 7.5 7a4.5 4.5 0 0 1 4.5-4.5A4.5 4.5 0 0 1 16.5 7" />
    <path d="M11.5 7a1 1 0 0 0-1-1" />
    <circle cx="9.5" cy="9.5" r="7.5" />
  </svg>
);
