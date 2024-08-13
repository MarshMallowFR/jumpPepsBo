type TextInputColors = 'orange' | 'blue';
interface TextInputProps {
  className?: string;
  color?: TextInputColors;
  defaultValue?: string;
  error?: string[];
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  idFor: string;
  label: string;
  placeholder?: string;
  settingKey: string;
  type?: string;
}

export const TextInput = ({
  className,
  color = 'blue',
  defaultValue,
  error,
  handleChange,
  label,
  idFor,
  placeholder = '',
  settingKey,
  type = 'text',
}: TextInputProps) => {
  const colorClasses = {
    orange: 'focus:border-orange-medium focus:ring-orange-medium',
    blue: 'focus:border-blue-500 focus:ring-blue-500',
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={idFor} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <input
        aria-describedby={`${idFor}-error`}
        className={`w-full rounded-md py-2 pl-2 text-sm placeholder:text-gray border-slate-300 ${colorClasses[color]}`}
        defaultValue={defaultValue}
        id={idFor}
        name={settingKey}
        onChange={handleChange}
        placeholder={placeholder}
        type={type}
      />

      {error ? (
        <div
          aria-live="polite"
          id={`${idFor}-error`}
          className="mt-2 text-sm text-red-500"
        >
          {error.map((error: string) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
};
