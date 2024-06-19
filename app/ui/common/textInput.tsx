interface TextInputProps {
  className?: string;
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
  defaultValue,
  error,
  handleChange,
  label,
  idFor,
  placeholder = '',
  settingKey,
  type = 'text',
}: TextInputProps) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={idFor} className="mb-2 block text-sm font-medium">
      {label}
    </label>
    <div className="relative mt-2 rounded-md">
      <div className="relative">
        <input
          aria-describedby={`${idFor}-error`}
          className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          defaultValue={defaultValue}
          id={idFor}
          name={settingKey}
          onChange={handleChange}
          placeholder={placeholder}
          type={type}
        />
      </div>
    </div>
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
