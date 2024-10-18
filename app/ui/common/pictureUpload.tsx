interface PictureUploadProps {
  handleChange: (file: File) => void;
  idFor: string;
  settingKey: string;
  error?: string[];
  type?: string;
}

export const PictureUpload = ({
  handleChange,
  idFor,
  settingKey,
  error,
  type = 'file',
}: PictureUploadProps) => (
  <div className="flex flex-col items-center justify-center">
    <div className="w-40">
      <div className="border-dashed border-2 border-gray-400  h-56 rounded-lg flex flex-col items-center justify-center p-3">
        <label
          htmlFor={idFor}
          className="cursor-pointer flex flex-col items-center"
        >
          <svg
            className="w-10 h-10 mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
            <span className="font-semibold">Cliquer pour charger</span> ou
            déposer une photo
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            PNG, JPEG, JPG OU WEBP (MAX. 5MB)
          </p>
        </label>
        <input
          id={idFor}
          name={settingKey}
          type={type}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleChange(e.target.files[0]);
            }
          }}
        />
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
  </div>
);
