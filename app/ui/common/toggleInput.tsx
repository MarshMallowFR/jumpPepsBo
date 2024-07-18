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
    <div className="mb-4">
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
          <div className="w-11 h-6 bg-orange-light rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white  after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-medium peer-checked:ring-2 peer-checked:ring-orange-light shadow-custom-shadow"></div>
        </label>
        {children}
      </div>
    </div>
  );
};
