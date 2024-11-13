import { Color } from '@/app/lib/types/color';
import { useState, useEffect } from 'react';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioInputProps {
  className?: string;
  color?: Color;
  defaultValue?: string;
  idFor: string;
  label: string;
  settingKey: string;
  options: RadioOption[];
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RadioInput = ({
  className,
  color = Color.BLUE,
  defaultValue,
  label,
  idFor,
  settingKey,
  options,
  handleChange,
}: RadioInputProps) => {
  const colorClasses = {
    [Color.ORANGE]: 'focus:border-orange-medium',
    [Color.BLUE]: 'focus:border-blue-medium',
  };
  const [checkedValue, setCheckedValue] = useState(defaultValue || '');

  useEffect(() => {
    setCheckedValue(defaultValue || '');
  }, [defaultValue]);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedValue(e.target.value);
    handleChange && handleChange(e);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <div className="flex gap-4">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${idFor}-${option.value}`}
              name={settingKey}
              value={option.value}
              checked={checkedValue === option.value}
              type="radio"
              className={`radio-input ${colorClasses[color]} focus:ring-0`}
              onChange={handleRadioChange}
            />
            <label
              htmlFor={`${idFor}-${option.value}`}
              className="ml-2 text-sm"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
