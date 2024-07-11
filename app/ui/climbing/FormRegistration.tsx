import { useState } from 'react';
import { ClimbingState } from '@/app/lib/actions/climbing/actions';
import { Button } from '../common/button';
import { TextInput } from '../common/textInput';
import { ToggleInput } from '../common/toggleInput';
import { PictureUpload } from '../common/PictureUpload';
import { Member } from '@/app/lib/types/climbing';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { handleBirthDate } from '../../utils/handleBirthday';
import { Toast } from '../common/Toast';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleIsMediaCompliant = () => {
    setIsMediaCompliant((prevState) => !prevState);
  };

  const handlePictureChange = (file: File) => {
    setPicture(file);
  };

  // Conversion valeurs du formulaire au bon format avant envoi
  const handleSubmit = (formData: FormData) => {
    formData.set('isMediaCompliant', isMediaCompliant.toString());
    if (picture) {
      formData.set('picture', picture);
    }

    dispatch(formData);
    if (formData) {
      setToastMessage('Inscription réussie!');
    }
  };

  // RETURN FINAL
  return (
    <>
      <form action={handleSubmit}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          <TextInput
            label="Prénom"
            idFor="firstName"
            settingKey="firstName"
            error={state?.errors?.firstName}
          />
          <TextInput
            idFor="lastName"
            label="Nom"
            settingKey="lastName"
            error={state?.errors?.lastName}
          />
          <div className="mb-4 w-full flex">
            <TextInput
              type="date"
              handleChange={handleBirthDate(setIsMinor)}
              label="Date de naissance"
              idFor="birthDate"
              placeholder="JJ/MM/AAAA"
              settingKey="birthDate"
              error={state?.errors?.birthDate}
            />
            <TextInput
              className="ml-2"
              type="tel"
              label="Numéro de téléphone"
              idFor="phoneNumber"
              settingKey="phoneNumber"
              error={state?.errors?.phoneNumber}
            />
            <TextInput
              className="ml-2 flex-1"
              type="email"
              label="Email"
              idFor="email"
              settingKey="email"
              error={state?.errors?.email}
            />
          </div>
          <TextInput
            label="Rue"
            idFor="street"
            settingKey="street"
            error={state?.errors?.street}
          />
          <div className="mb-4 w-full flex">
            <TextInput
              type="number"
              label="Code postal"
              idFor="zipCode"
              settingKey="zipCode"
              error={state?.errors?.zipCode}
            />
            <TextInput
              className="ml-4 flex-1"
              label="Ville"
              idFor="city"
              settingKey="city"
              error={state?.errors?.city}
            />
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
          <ToggleInput
            defaultValue={isMediaCompliant}
            handleChange={handleIsMediaCompliant}
            idFor="isMediaCompliant"
            label="Autorisation média"
            settingKey="isMediaCompliant"
          >
            <label
              htmlFor="isMediaCompliant"
              className="ml-4 mr flex items-center"
            >
              {isMediaCompliant ? 'Accepte' : 'Refuse'}
              {isMediaCompliant ? (
                <CheckIcon className="h-4 w-4 ml-2 text-green-600 font-bold" />
              ) : (
                <XMarkIcon className="h-4 w-4 ml-2 text-red-600" />
              )}
            </label>
            <span>
              Autorise le club à utiliser l'image de l'adhérent à des fins non
              commerciales sur tout type de support
            </span>
          </ToggleInput>
          <PictureUpload
            handleChange={handlePictureChange}
            idFor="picture"
            settingKey="picture"
            error={state?.errors?.picture}
          />
          {state?.message ? (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button type="submit">S'incrire</Button>
        </div>
      </form>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
