import { useState, useEffect } from 'react';
import { ClimbingState } from '@/app/lib/actions/climbing/actions';
import { Button } from '../common/button';
import { TextInput } from '../common/textInput';
import { ToggleInput } from '../common/toggleInput';
import { Member } from '@/app/lib/types/climbing';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { handleBirthDate } from '../../utils/handleBirthday';
import { Toast } from '../common/Toast';
import { UploadPicture } from '../common/UploadPicture';
import { PictureUpload } from '../common/PictureUpload';

interface FormProps {
  dispatch: (payload: FormData) => void;
  member?: Member;
  state: ClimbingState;
}

export default function FormRegistration({
  state,
  dispatch,
  member,
}: FormProps) {
  const [isMinor, setIsMinor] = useState(false);
  const [isMediaCompliant, setIsMediaCompliant] = useState(false);
  const [picture, setPicture] = useState<File | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleIsMediaCompliant = () => {
    setIsMediaCompliant((prevState) => !prevState);
  };

  const handlePictureChange = (file: File) => {
    setPicture(file);
    // url locale pour la prévisualisation en attendant l'envoie du formulaire
    const url = URL.createObjectURL(file);
    setPictureUrl(url);
  };

  // Conversion valeurs du formulaire au bon format avant envoi
  const handleSubmit = (formData: FormData) => {
    formData.set('isMediaCompliant', isMediaCompliant.toString());
    if (picture) {
      formData.set('picture', picture);
    }

    dispatch(formData);
    // if (formData) {
    //   setToastMessage('Inscription réussie!');
    // }
  };

  // Pour nettoyer l'URL de l'image lorsqu'elle n'est plus nécessaire
  useEffect(() => {
    return () => {
      if (pictureUrl) {
        URL.revokeObjectURL(pictureUrl);
      }
    };
  }, [pictureUrl]);

  // RETURN FINAL
  return (
    <>
      <form
        action={handleSubmit}
        className="rounded-md shadow-custom-shadow bg-gray p-8 min-w-0 w-full md:w-1/2"
      >
        <h2 className="text-lg font-bold">Formulaire de pré-insciption</h2>
        <p className="my-2">
          L'inscription sera effective une fois le formulaire rempli et le
          paiment de la cotisation effectué auprès de notre équipe.
        </p>
        <div className=" flex mt-6 space-x-3">
          <TextInput
            className="basis-1/2"
            label="Prénom"
            idFor="firstName"
            settingKey="firstName"
            error={state?.errors?.firstName}
          />
          <TextInput
            className="basis-1/2"
            idFor="lastName"
            label="Nom"
            settingKey="lastName"
            error={state?.errors?.lastName}
          />
        </div>
        <TextInput
          type="email"
          label="Email"
          idFor="email"
          settingKey="email"
          error={state?.errors?.email}
        />

        <div className="flex mt-3 space-x-3">
          <TextInput
            className="basis-1/2"
            type="tel"
            label="Numéro de téléphone"
            idFor="phoneNumber"
            settingKey="phoneNumber"
            error={state?.errors?.phoneNumber}
          />
          <TextInput
            className="basis-1/2"
            type="date"
            handleChange={handleBirthDate(setIsMinor)}
            label="Date de naissance"
            idFor="birthDate"
            placeholder="JJ/MM/AAAA"
            settingKey="birthDate"
            error={state?.errors?.birthDate}
          />
        </div>
        <div className="mt-3">
          <TextInput
            label="Rue"
            idFor="street"
            settingKey="street"
            error={state?.errors?.street}
          />
          <div className="flex space-x-3">
            <TextInput
              className="basis-1/3"
              type="number"
              label="Code postal"
              idFor="zipCode"
              settingKey="zipCode"
              error={state?.errors?.zipCode}
            />
            <TextInput
              className="basis-2/3"
              label="Ville"
              idFor="city"
              settingKey="city"
              error={state?.errors?.city}
            />
          </div>
        </div>
        {!isMinor ? null : (
          <div className="mb-4">
            <h2 className="mb-2 block text-sm font-medium">
              Coordonnées du représentant légal
            </h2>
            <div className="w-full flex justify-around">
              <TextInput
                idFor="legalContactFirstName"
                label="Prénom du contact"
                settingKey="legalContactFirstName"
                error={state?.errors?.legalContactFirstName}
              />
              <TextInput
                defaultValue={member?.legalContactLastName}
                idFor="legalContactLastName"
                label="Nom du contact"
                settingKey="legalContactLastName"
                error={state?.errors?.legalContactLastName}
              />
              <TextInput
                defaultValue={member?.legalContactPhoneNumber}
                idFor="legalContactPhoneNumber"
                label="Numéro de téléphone du contact"
                settingKey="legalContactPhoneNumber"
                error={state?.errors?.legalContactPhoneNumber}
              />
            </div>
          </div>
        )}
        <div className="flex my-3 justify-between space-x-9">
          <div className="basis-1/2">
            <UploadPicture
              icon={
                <InformationCircleIcon
                  className="h-4 w-4 ml-2 text-gray-600"
                  title=" Formats autorisés: PNG, JPEG, JPG OU WEBP (MAX. 5MB)"
                />
              }
              label="Photo d'identité"
              handleChange={handlePictureChange}
              idFor="picture"
              settingKey="picture"
              imageUrl={pictureUrl ?? undefined}
              error={state?.errors?.picture}
            />
          </div>
          <div className="basis-1/2">
            <ToggleInput
              icon={
                <InformationCircleIcon
                  className="h-4 w-4 ml-2 text-gray-600"
                  title="Autorise le club à utiliser l'image de l'adhérent à des fins non commerciales sur tout type de support"
                />
              }
              label="Autorisation média"
              defaultValue={isMediaCompliant}
              handleChange={handleIsMediaCompliant}
              idFor="isMediaCompliant"
              settingKey="isMediaCompliant"
            >
              <label
                htmlFor="isMediaCompliant"
                className="ml-4 mr flex items-center"
              >
                {isMediaCompliant ? 'Accepte' : 'Refuse'}
              </label>
            </ToggleInput>
          </div>
        </div>
        {state?.message ? (
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
        ) : null}

        <div className="mt-6 flex justify-center">
          <Button type="submit">ENVOYER</Button>
        </div>
      </form>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
