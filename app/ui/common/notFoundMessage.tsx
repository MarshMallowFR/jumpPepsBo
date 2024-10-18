import React from 'react';
import clsx from 'clsx';
import { Color } from '@/app/lib/types/color';

type NotFoundMessageProps = {
  message: string;
  color?: Color;
};

export default function NotFoundMessage({
  message,
  color = Color.BLUE,
}: NotFoundMessageProps) {
  const colorClasses = {
    [Color.ORANGE]: 'bg-orange-light',
    [Color.BLUE]: 'bg-blue-extralight text-blue-medium',
  };
  return (
    <div
      className={clsx(
        `w-full p-4 rounded-lg mt-4 text-center text-sm font-semibold`,
        colorClasses[color],
      )}
    >
      {message}
    </div>
  );
}
