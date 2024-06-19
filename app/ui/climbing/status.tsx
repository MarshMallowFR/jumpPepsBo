import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Status({ isValid }: { isValid: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-500': !isValid,
          'bg-green-500 text-white': isValid,
        },
      )}
    >
      {isValid ? (
        <CheckIcon className="w-4 text-white" />
      ) : (
        <ClockIcon className="w-4 text-gray-500" />
      )}
    </span>
  );
}
