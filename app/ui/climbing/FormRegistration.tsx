// import dayjs from 'dayjs';
import { ChangeEvent, useState } from 'react';
import { ClimbingState } from '@/app/lib/actions/climbing/actions'; // type utilisé pour la gestiondes erreurs
import { Button } from '../common/button';
import { TextInput } from '../common/textInput';
import { Member } from '@/app/lib/types/climbing'; // type membre

//typage des props du formulaire
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
  const [isMediaCompliant, setIsMediaCompliant] = useState(false);

  // Gestion age
  const [isMinor, setIsMinor] = useState(false);
  const handleBirthDate = (e: ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-');

    if (!day || !month || !year) {
      return;
    }

    const birthday = new Date(+year, +month - 1, +day);
    const today = new Date();
    const monthDiff = today.getMonth() - birthday.getMonth();
    let age = today.getFullYear() - birthday.getFullYear();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthday.getDate())
    ) {
      age--;
    }

    setIsMinor(age < 18);
  };
  // Gestion media
  const handleIsMediaCompliant = () => {
    setIsMediaCompliant(true);
  };

  // non utilisé
  //   const formatTimestamp = (date?: string) => {
  //     return date ? String(dayjs(date).format('YYYY-MM-DD')) : '';
  //   };

  // RETURN FINAL
  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <TextInput
          type="text"
          label="Prénom"
          idFor="firstName"
          settingKey="firstName"
          error={state.errors?.firstName}
        />
        <TextInput
          type="text"
          idFor="lastName"
          label="Nom"
          settingKey="lastName"
          error={state.errors?.lastName}
        />
        <div className="mb-4 w-full flex">
          <TextInput
            type="date"
            handleChange={handleBirthDate}
            label="Date de naissance"
            idFor="birthDate"
            placeholder="JJ/MM/AAAA"
            settingKey="birthDate"
            error={state.errors?.birthDate}
          />
          <TextInput
            className="ml-2"
            type="tel"
            label="Numéro de téléphone"
            idFor="phoneNumber"
            settingKey="phoneNumber"
            error={state.errors?.phoneNumber}
          />
          <TextInput
            className="ml-2 flex-1"
            type="email"
            label="Email"
            idFor="email"
            settingKey="email"
            error={state.errors?.email}
          />
        </div>
        <TextInput
          type="text"
          label="Rue"
          idFor="street"
          settingKey="street"
          error={state.errors?.street}
        />
        <div className="mb-4 w-full flex">
          <TextInput
            type="number"
            label="Code postal"
            idFor="zipCode"
            settingKey="zipCode"
            error={state.errors?.zipCode}
          />
          <TextInput
            className="ml-4 flex-1"
            type="text"
            label="Ville"
            idFor="city"
            settingKey="city"
            error={state.errors?.city}
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
                error={state.errors?.legalContactFirstName}
              />
              <TextInput
                defaultValue={member?.legalContactLastName}
                idFor="legalContactLastName"
                label="Nom du contact"
                settingKey="legalContactLastName"
                error={state.errors?.legalContactLastName}
              />
              <TextInput
                defaultValue={member?.legalContactPhoneNumber}
                idFor="legalContactPhoneNumber"
                label="Numéro de téléphone du contact"
                settingKey="legalContactPhoneNumber"
                error={state.errors?.legalContactPhoneNumber}
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
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
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" />
          </label>
        </div>
        {state.message ? (
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Button type="submit">S'incrire</Button>
      </div>
    </form>
  );
}
