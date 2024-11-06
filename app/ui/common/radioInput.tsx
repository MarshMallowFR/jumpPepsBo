import { Color } from '@/app/lib/types/color';

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
}

export const RadioInput = ({
  className,
  color = Color.BLUE,
  defaultValue,
  label,
  idFor,
  settingKey,
  options,
}: RadioInputProps) => {
  const colorClasses = {
    [Color.ORANGE]: 'focus:border-orange-medium',
    [Color.BLUE]: 'focus:border-blue-medium',
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
              defaultChecked={defaultValue === option.value}
              type="radio"
              className={`radio-input ${colorClasses[color]} focus:ring-0`}
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
