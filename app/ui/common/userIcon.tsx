import React from 'react';

export default function UserIcon({ size = 20, color = 'gray' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-${color}-500`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2a5 5 0 100 10 5 5 0 000-10zM7 12a7 7 0 0110 0 6.972 6.972 0 013.528 5.487c.06.33-.188.627-.523.627H4.995c-.334 0-.583-.297-.523-.627A6.972 6.972 0 017 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}
