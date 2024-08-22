interface PictureUploadProps {
  error?: string[];
  handleChange: (file: File) => void;
  idFor: string;
  imageUrl?: string;
  settingKey: string;
  type?: string;
}

export const PictureUpload = ({
  error,
  handleChange,
  idFor,
  imageUrl,
  settingKey,
  type = 'file',
}: PictureUploadProps) => {
  const handleChangePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleChange(files[0]);
    }
  };
  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor={idFor}
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="rounded-full w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
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
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Cliquer pour charger</span> ou
              déposer une photo
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPEG, JPG OU WEBP (MAX. 5MB)
            </p>
          </div>
        )}

        <input
          className="hidden"
          onChange={handleChangePicture}
          id={idFor}
          name={settingKey}
          type={type}
        />
      </label>
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
