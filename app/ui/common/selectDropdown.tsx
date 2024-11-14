'use client';

import { useState } from 'react';
import { Color } from '@/app/lib/types/color';

interface SelectDropdownProps {
  label: string;
  options: { name: string; id: string }[];
  onSelect: (value: string) => void;
  color?: Color;
}

export default function SelectDropdown({
  label,
  options,
  onSelect,
  color = Color.BLUE,
}: SelectDropdownProps) {
  const colorClasses = {
    [Color.ORANGE]: {
      button: 'bg-orange-medium hover:bg-orange-light',
      option: 'hover:bg-orange-light hover:text-orange-medium',
    },
    [Color.BLUE]: {
      button: 'bg-blue-medium hover:bg-blue-light hover:text-blue-500',
      option: 'hover:bg-blue-extralight hover:text-blue-500',
    },
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value: string, label: string) => {
    setSelectedOption(label);
    onSelect(value);
    setIsOpen(false);
  };

  const colorClass = colorClasses[color];

  return (
    <div className="relative inline-block text-left mr-4">
      <button
        onClick={toggleDropdown}
        className={`inline-flex justify-center w-full rounded-md px-4 py-2 text-sm font-medium text-white ${colorClass.button} focus:outline-none`}
      >
        {selectedOption || label}{' '}
        {/* Display selected season or initial label */}
        <svg
          className={`-mr-1 ml-2 h-5 w-5 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-custom-shadow bg-white z-50">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id, option.name)}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${colorClass.option}`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
