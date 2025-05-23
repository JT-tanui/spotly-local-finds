
import React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

// Spinner icon for loading states
export function Spinner({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

// Common icons used throughout the app
export const Icons = {
  spinner: Spinner,
  // Add more icons as needed
}
