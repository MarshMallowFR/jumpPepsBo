import React from 'react';

interface UserInitialProps {
  firstName: string;
  lastName: string;
}

export default function UserInitial({ firstName, lastName }: UserInitialProps) {
  const initials = `${lastName[0]}${firstName[0]}`.toUpperCase();

  return (
    <div className="flex items-center justify-center w-full h-full rounded-full bg-blue-extralight">
      <span className="text-blue-medium font-bold text-sm">{initials}</span>
    </div>
  );
}
