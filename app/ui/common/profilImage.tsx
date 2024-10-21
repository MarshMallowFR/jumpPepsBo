interface ProfileImageProps {
  imageUrl: string;
  idFor: string;
  settingKey: string;
  handlePictureChange: (file: File) => void;
  error?: string[];
  member?: {
    firstName: string;
    lastName: string;
  };
  type?: string;
}

export const ProfileImage = ({
  imageUrl,
  handlePictureChange,
  error,
  member,
  idFor,
  settingKey,
  type = 'file',
}: ProfileImageProps) => (
  <div className="my-4 flex flex-col items-center">
    <label htmlFor={idFor}>
      <div className="relative  w-40 h-56 rounded-lg overflow-hidden cursor-pointer">
        <img
          src={imageUrl}
          alt={`${member?.firstName} ${member?.lastName}'s profile picture`}
          className="w-full h-full object-cover"
        />
      </div>
    </label>
    <input
      id={idFor}
      type={type}
      name={settingKey}
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          handlePictureChange(e.target.files[0]);
        }
      }}
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
