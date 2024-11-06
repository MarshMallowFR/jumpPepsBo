import { useState } from 'react';
import { Color } from '@/app/lib/types/color';

interface CheckboxOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  color?: Color;
  defaultValues?: { [key: string]: boolean };
  onChange: (selectedValues: { [key: string]: boolean }) => void;
  options: CheckboxOption[];
  title: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  color = Color.BLUE,
  defaultValues = {},
  onChange,
  options,
  title,
}) => {
  const colorClasses = {
    [Color.ORANGE]: 'peer-checked:bg-orange-medium',
    [Color.BLUE]: 'peer-checked:bg-blue-medium',
  };

  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: boolean;
  }>(defaultValues);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isChecked = event.target.checked;

    const newSelectedValues = {
      ...selectedValues,
      [value]: isChecked,
    };

    setSelectedValues(newSelectedValues);
    onChange(newSelectedValues);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      {options.map((option) => (
        <div key={option.value} className="flex items-center mb-2">
          <input
            id={option.value}
            type="checkbox"
            value={option.value}
            checked={!!selectedValues[option.value]}
            onChange={handleCheckboxChange}
            className={`mr-2 border rounded-sm appearance-none ${colorClasses[color]} transition-colors border-black focus:ring-0`}
          />
          <label htmlFor={option.value}>{option.label}</label>
        </div>
      ))}
    </div>
  );
};
