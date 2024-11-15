import { Color } from '@/app/lib/types/color';

interface CheckboxProps {
  color?: Color;
  defaultValue?: boolean;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  idFor: string;
}

export const Checkbox = ({
  color = Color.BLUE,
  defaultValue,
  handleChange,
  idFor,
}: CheckboxProps) => {
  const colorClasses = {
    [Color.ORANGE]: 'peer-checked:bg-orange-medium',
    [Color.BLUE]: 'peer-checked:bg-blue-medium',
  };

  return (
    <div className="flex items-center">
      <label
        htmlFor={idFor}
        className={`relative flex items-center justify-center cursor-pointer`}
      >
        <input
          checked={defaultValue}
          id={idFor}
          type="checkbox"
          onChange={handleChange}
          className="hidden peer"
        />
        <div
          className={`w-6 h-6 border rounded-md ${colorClasses[color]} transition-colors transition-border border-black peer-checked:border-none`}
        ></div>
        <svg
          className={`absolute w-4 h-4 text-white peer-checked:block`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </label>
    </div>
  );
};
