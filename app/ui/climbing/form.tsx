import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ClimbingState } from '@/app/lib/actions/climbing/actions';
import {
  CheckIcon,
  ClockIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Member } from '@/app/lib/types/climbing';
import { Button } from '../common/buttons';
import { TextInput } from '../common/textInput';
import { ToggleInput } from '../common/toggleInput';

import { handleBirthDate } from '../../utils/handleBirthday';
import { PictureUpload } from '../common/pictureUpload';
import ToastContextProvider, {
  ToastType,
} from '@/app/lib/contexts/toastContext';
import ToastWrapper from '../common/toastWrapper';

interface FormProps {
  dispatch: (payload: FormData) => Promise<ClimbingState>;
  member?: Member;
  state: ClimbingState;
}

export default function Form({ state, dispatch, member }: FormProps) {
  const [displayToast, setDisplayToast] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [hasPaid, setHasPaid] = useState(member?.hasPaid ?? false);
  const [isMediaCompliant, setIsMediaCompliant] = useState(
    member?.isMediaCompliant ?? false,
  );

  const [picture, setPicture] = useState<File | string | null>(
    member?.picture || null,
  );
  const [pictureUrl, setPictureUrl] = useState<string | null>(
    member?.picture || null,
  );
  const handleHasPaid = () => {
    setHasPaid((prevState) => !prevState);
  };

  const handleIsMediaCompliant = () => {
    setIsMediaCompliant((prevState) => !prevState);
  };

  const handlePictureChange = (file: File) => {
    setPicture(file);
    // url locale pour la prévisualisation en attendant l'envoie du formulaire
    const url = URL.createObjectURL(file);
    setPictureUrl(url);
  };

  const formatTimestamp = (date?: string) => {
    return date ? String(dayjs(date).format('YYYY-MM-DD')) : '';
  };

  // Conversion valeurs du formulaire au bon format avant envoi
  const handleSubmit = async (formData: FormData) => {
    formData.set('isMediaCompliant', isMediaCompliant.toString());
    formData.set('hasPaid', hasPaid.toString());
    if (picture) {
      formData.set('picture', picture);
    }
    await dispatch(formData);
    setDisplayToast(true);
  };

  // Pour nettoyer l'URL de l'image lorsqu'elle n'est plus nécessaire
  useEffect(() => {
    return () => {
      if (pictureUrl) {
        URL.revokeObjectURL(pictureUrl);
      }
    };
  }, [pictureUrl]);

  // Redirection vers dashboard après un délai en cas de succès
  useEffect(() => {
    if (state?.isSuccess) {
      const timer = setTimeout(() => {
        window.location.href = '/dashboard/climbing'; // Redirection côté client
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.isSuccess]);

  return (
    <>
      <form action={handleSubmit}>
        <div className="rounded-md p-4 md:p-6">
          <TextInput
            defaultValue={member?.firstName}
            label="Prénom"
            idFor="firstName"
            settingKey="firstName"
            error={state?.errors?.firstName}
          />
          <TextInput
            defaultValue={member?.lastName}
            error={state?.errors?.lastName}
            idFor="lastName"
            label="Nom"
            settingKey="lastName"
          />
          <div className="mb-4 w-full flex">
            <TextInput
              defaultValue={formatTimestamp(member?.birthDate)}
              error={state?.errors?.birthDate}
              handleChange={handleBirthDate(setIsMinor)}
              label="Date de naissance"
              idFor="birthDate"
              placeholder="JJ/MM/AAAA"
              settingKey="birthDate"
              type="date"
            />
            <TextInput
              className="ml-2"
              defaultValue={member?.phoneNumber}
              label="Numéro de téléphone"
              idFor="phoneNumber"
              settingKey="phoneNumber"
              error={state?.errors?.phoneNumber}
            />
            <TextInput
              className="ml-2 flex-1"
              defaultValue={member?.email}
              label="Email"
              idFor="email"
              settingKey="email"
              error={state?.errors?.email}
            />
          </div>
          <TextInput
            defaultValue={member?.street}
            label="Rue"
            idFor="street"
            settingKey="street"
            error={state?.errors?.street}
          />
          <div className="mb-4 w-full flex">
            <TextInput
              defaultValue={member?.zipCode}
              label="Code postal"
              idFor="zipCode"
              settingKey="zipCode"
              error={state?.errors?.zipCode}
            />
            <TextInput
              className="ml-4 flex-1"
              defaultValue={member?.city}
              label="Ville"
              idFor="city"
              settingKey="city"
              error={state?.errors?.city}
            />
          </div>
          <div className="flex mb-6">
            <ToggleInput
              defaultValue={hasPaid}
              handleChange={handleHasPaid}
              idFor="hasPaid"
              label="Statut du paiement"
              settingKey="hasPaid"
            >
              <label className="ml-4 mr flex items-center">
                Payé{' '}
                {hasPaid ? (
                  <CheckIcon className="h-4 w-4 ml-2 text-green-600 font-bold" />
                ) : (
                  <ClockIcon className="h-4 w-4 ml-2 text-red-600" />
                )}
              </label>
            </ToggleInput>

            <div className="ml-8">
              <ToggleInput
                icon={
                  <InformationCircleIcon
                    className="h-4 w-4 ml-2 text-gray-600"
                    title="Autorise le club à utiliser l'image de l'adhérent à des fins non commerciales sur tout type de support"
                  />
                }
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
              </ToggleInput>
            </div>
          </div>
          {!isMinor ? null : (
            <div className="mt-8 mb-4">
              <h2 className="mb-2 text-lg font-medium text-blue-500">
                Coordonnées du représentant légal
              </h2>
              <div className="w-full flex justify-around">
                <TextInput
                  defaultValue={member?.legalContactFirstName}
                  error={state.errors?.legalContactFirstName}
                  idFor="legalContactFirstName"
                  label="Prénom du contact"
                  settingKey="legalContactFirstName"
                />
                <TextInput
                  defaultValue={member?.legalContactLastName}
                  error={state?.errors?.legalContactLastName}
                  idFor="legalContactLastName"
                  label="Nom du contact"
                  settingKey="legalContactLastName"
                />
                <TextInput
                  defaultValue={member?.legalContactPhoneNumber}
                  error={state?.errors?.legalContactPhoneNumber}
                  idFor="legalContactPhoneNumber"
                  label="Numéro de téléphone du contact"
                  settingKey="legalContactPhoneNumber"
                />
              </div>
            </div>
          )}
          {pictureUrl ? (
            <div className="my-4 flex flex-col items-center">
              <label htmlFor="picture-upload">
                <img
                  src={pictureUrl}
                  width={300}
                  height={300}
                  alt={`${member?.firstName} ${member?.lastName}'s profile picture`}
                  className="cursor-pointer"
                />
              </label>
              <input
                id="picture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePictureChange(e.target.files[0]);
                  }
                }}
              />
              {state?.errors && (
                <p className="mt-2 text-sm text-red-500">
                  {state?.errors.picture}
                </p>
              )}
            </div>
          ) : (
            <PictureUpload
              handleChange={handlePictureChange}
              idFor="picture"
              settingKey="picture"
              error={state?.errors?.picture}
            />
          )}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/climbing"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Annuler
          </Link>
          <Button type="submit">{member ? 'Editer' : 'Créer'} membre</Button>
        </div>
      </form>
      <ToastContextProvider>
        <ToastWrapper
          visible={displayToast}
          message={state?.message}
          toastType={state?.isSuccess ? ToastType.SUCCESS : ToastType.ERROR}
        />
      </ToastContextProvider>
    </>
  );
}
