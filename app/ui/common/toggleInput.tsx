export enum ToggleInputColors {
  ORANGE = 'orange',
  BLUE = 'blue',
}
interface ToggleInputProps {
  children: React.ReactNode;
  color?: ToggleInputColors;
  defaultValue?: boolean;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  idFor: string;
  label: string;
  settingKey: string;
}

export const ToggleInput = ({
  children,
  color = ToggleInputColors.BLUE,
  defaultValue,
  handleChange,
  icon,
  idFor,
  label,
  settingKey,
}: ToggleInputProps) => {
  const colorClasses = {
    [ToggleInputColors.ORANGE]: {
      bg: 'bg-orange-light peer-checked:bg-orange-medium',
      ring: 'peer-checked:ring-orange-light',
    },
    [ToggleInputColors.BLUE]: {
      bg: 'bg-blue-200 peer-checked:bg-blue-500',
      ring: 'peer-checked:ring-blue-400',
    },
  };
  return (
    <div>
      <div className="mb-2 text-sm font-semibold flex items-center">
        <label>{label}</label>
        {icon}
      </div>
      <div className="flex items-center">
        <label
          htmlFor={idFor}
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            checked={defaultValue}
            id={idFor}
            name={settingKey}
            type="checkbox"
            aria-describedby="status-error"
            onChange={handleChange}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 ${colorClasses[color].bg} rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white after:rounded-full after:h-5 after:w-5 after:transition-all ${colorClasses[color].ring}`}
          ></div>
        </label>
        {children}
      </div>
    </div>
  );
};
