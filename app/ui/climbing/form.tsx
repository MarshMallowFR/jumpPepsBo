import dayjs from 'dayjs';
import { ChangeEvent, useState } from 'react';
import { ClimbingState } from '@/app/lib/actions/climbing/actions';
import {
  CheckIcon,
  ClockIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Member } from '@/app/lib/types/climbing';
import { Button } from '../common/button';
import { TextInput } from '../common/textInput';
import { ToggleInput } from '../common/toggleInput';
import { handleBirthDate } from './handleBirthday';
import { PictureUpload } from '../common/PictureUpload';

//A CORRIGER: Création du membre se fait bien dans la BBD mais le champs hasPaid se met automatiquement à true + erreur lors de la redirection si redirection s=> Error: Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported. at stringify
//Database Error: Failed to create a member. Error: NEXT_REDIRECT
interface FormProps {
  dispatch: (payload: FormData) => void;
  member?: Member;
  state: ClimbingState;
}

export default function Form({ state, dispatch, member }: FormProps) {
  const [hasPaid, setHasPaid] = useState(member?.hasPaid ?? false); // lors de la création d'un membre, se met à true (test fait avec true par default aussi). pourquoi?!
  const [isMediaCompliant, setIsMediaCompliant] = useState(
    member?.isMediaCompliant ?? false,
  );
  const [isMinor, setIsMinor] = useState(false);
  const [picture, setPicture] = useState<File | null>(null);

  const handleHasPaid = () => {
    setHasPaid((prevState) => !prevState);
  };

  const handleIsMediaCompliant = () => {
    setIsMediaCompliant((prevState) => !prevState);
  };

  const handlePictureChange = (file: File) => {
    setPicture(file);
  };

  const formatTimestamp = (date?: string) => {
    return date ? String(dayjs(date).format('YYYY-MM-DD')) : '';
  };

  // Conversion valeurs du formulaire au bon format avant envoi
  const handleSubmit = (formData: FormData) => {
    formData.set('isMediaCompliant', isMediaCompliant.toString());
    formData.set('hasPaid', hasPaid.toString());
    if (picture) {
      formData.set('picture', picture);
    }
    dispatch(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
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
        <div className="mb-4 flex items-center">
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
            <label htmlFor="hasPaid" className="ml-4 mr flex items-center">
              {isMediaCompliant ? 'Accepte' : 'Refuse'}
              {isMediaCompliant ? (
                <CheckIcon className="h-4 w-4 ml-2 text-green-600 font-bold" />
              ) : (
                <XMarkIcon className="h-4 w-4 ml-2 text-red-600" />
              )}
            </label>
          </ToggleInput>
        </div>
        {!isMinor ? null : (
          <div className="mb-4">
            <h2 className="mb-2 block text-sm font-medium">
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
        <Link
          href="/dashboard/climbing"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Annuler
        </Link>
        <Button type="submit">{member ? 'Editer' : 'Créer'} membre</Button>
      </div>
    </form>
  );
}
