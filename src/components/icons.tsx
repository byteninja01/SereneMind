import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
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
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      <path d="M12 18a6 6 0 0 0 6-6c0-1.66-1.34-3-3-3s-3 1.34-3 3" />
      <path d="M12 18a6 6 0 0 1-6-6c0-1.66 1.34-3 3-3s3 1.34 3 3" />
    </svg>
  );
}
