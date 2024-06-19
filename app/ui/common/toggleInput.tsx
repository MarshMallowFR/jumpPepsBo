interface ToggleInputProps {
  children: React.ReactNode;
  defaultValue?: boolean;
  icon?: React.ReactNode;
  label: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  idFor: string;
  settingKey: string;
}

export const ToggleInput = ({
  children,
  defaultValue,
  icon,
  label,
  settingKey,
  handleChange,
  idFor,
}: ToggleInputProps) => {
  return (
    <div className="flex-1">
      <label htmlFor={idFor} className="mb-2 text-sm font-medium flex">
        {label}
        {icon}
      </label>
      <div className="rounded-md">
        <div className="flex gap-4">
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                checked={defaultValue}
                id={idFor}
                name={settingKey}
                type="checkbox"
                aria-describedby="status-error"
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              {children}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
