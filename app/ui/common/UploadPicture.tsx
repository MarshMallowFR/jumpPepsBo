import { CameraIcon } from '@heroicons/react/24/solid';

interface UploadPictureProps {
  error?: string[];
  handleChange: (file: File) => void;
  icon?: React.ReactNode;
  label: string;
  idFor: string;
  settingKey: string;
  type?: string;
  imageUrl?: string;
}

export const UploadPicture = ({
  error,
  handleChange,
  idFor,
  label,
  icon,
  settingKey,
  imageUrl,
  type = 'file',
}: UploadPictureProps) => {
  const handleChangePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleChange(files[0]);
    }
  };
  return (
    <div>
      <div className="mb-2 text-sm font-semibold flex items-center">
        <label>{label}</label>
        {icon}
      </div>
      <label
        htmlFor={idFor}
        className="flex items-center justify-center w-14 h-14 bg-orange-medium rounded-full shadow-custom-shadow cursor-pointer"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="rounded-full w-full h-full object-cover"
          />
        ) : (
          <CameraIcon className="text-white h-5 w-5" />
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
