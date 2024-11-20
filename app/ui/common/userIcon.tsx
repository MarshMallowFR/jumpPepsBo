import React from 'react';

export default function UserIcon() {
  return (
    <svg
      className={`w-full h-full`}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fond circulaire */}
      <circle cx="50" cy="50" r="50" className="fill-blue-extralight" />

      {/* Tête du personnage */}
      <circle cx="50" cy="35" r="15" className="fill-blue-medium" />

      {/* Corps du personnage */}
      <path d="M 25 75 A 25 25 0 0 1 75 75" className="fill-blue-medium" />
    </svg>
  );
}
