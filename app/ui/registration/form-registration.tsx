import { useState, useEffect } from 'react';
import { ClimbingState } from '@/app/lib/actions/climbing/actions';
import { Color } from '@/app/lib/types/color';
import { Button } from '../common/buttons';
import { TextInput } from '../common/textInput';
import { ToggleInput } from '../common/toggleInput';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { handleBirthDate } from '../../utils/handleBirthday';
import { UploadPicture } from '../common/registrationPictureUpload';
import ToastContextProvider, {
  ToastType,
} from '@/app/lib/contexts/toastContext';
import ToastWrapper from '../common/toastWrapper';
import { RadioInput } from '../common/radioInput';
import { Season } from '@/app/lib/types/season';
import { Member } from '@/app/lib/types/climbing';
import { genderOptions } from '@/app/utils/formOptions';
import { Checkbox } from '../common/checkbox';

interface FormProps {
  dispatch: (payload: FormData) => Promise<ClimbingState>;
  state: ClimbingState;
  season: Season;
}

export default function FormRegistration({
  state,
  dispatch,
  season,
}: FormProps) {
  const initialState = {
    contactFirstName: '',
    contactLastName: '',
    firstName: '',
    lastName: '',
    isMediaCompliant: true,
  };

  const [member, setMember] = useState<Partial<Member> | undefined>(
    initialState,
  );
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [isMinor, setIsMinor] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayToast, setDisplayToast] = useState(false);

  // Remise à zéro des champs du formulaire si tout est OK
  useEffect(() => {
    if (state?.isSuccess) {
      setMember(initialState);
      setIsMinor(false);
      setDisplayToast(true);
      const form = document.querySelector('form');
      if (form) {
        form.reset();
      }
    }
  }, [state?.isSuccess]);

  useEffect(() => {
    return () => {
      if (member?.picture) {
        URL.revokeObjectURL(member.picture);
      }
    };
  }, [member?.picture]);

  const handleMemberChange = (
    value: string | boolean | null,
    key: keyof Member,
  ) => {
    setMember((oldMemberValues) => ({
      ...oldMemberValues,
      [key]: value,
    }));
  };

  const handlePictureChange = (file: File) => {
    const url = URL.createObjectURL(file); // url locale pour la prévisualisation en attendant l'envoie du formulaire
    setPictureFile(file);
    setMember((oldMemberValues) => ({
      ...oldMemberValues,
      picture: url,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckboxChecked(e.target.checked);
  };

  // Conversion valeurs du formulaire au bon format avant envoi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set(
      'isMediaCompliant',
      (member?.isMediaCompliant ?? true).toString(),
    );

    if (pictureFile) {
      formData.set('picture', pictureFile);
    } else if (member?.picture) {
      formData.set('picture', member.picture);
    } // Voir si le else est vraiment ncessaire ici
    try {
      await dispatch(formData);
      setDisplayToast(true);
    } catch (error) {
      console.error('Erreur lors de l’envoi du formulaire', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-md shadow-custom-shadow bg-gray p-8 max-w-full w-full mx-auto"
      >
        <div className="text-xl font-bold">
          <h2>GRIMP PEP'S</h2>
          <div className="text-xl font-bold flex flex-wrap">
            <h2 className="mr-2">Formulaire d'inscription</h2>
            <h2>{season.name}</h2>
          </div>
        </div>
        <p className="mt-4">Les champs marqués d'un * sont obligatoires.</p>
        <p className="text-lg mb-2 mt-4 font-semibold text-orange-medium">
          Informations sur l'adhérent.e
        </p>
        <div className="flex flex-col md:flex-row items-start">
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
            imageUrl={member?.picture ?? undefined}
            error={state?.errors?.picture}
          />
          <div className="mt-4 md:mt-0 md:ml-4 flex-grow-4 flex-grow w-full">
            <div className="flex flex-col">
              <TextInput
                color={Color.ORANGE}
                idFor="lastName"
                label="Nom *"
                settingKey="lastName"
                error={state?.errors?.lastName}
                handleChange={(event) =>
                  handleMemberChange(event.target.value, 'lastName')
                }
              />
              <TextInput
                color={Color.ORANGE}
                label="Prénom *"
                idFor="firstName"
                settingKey="firstName"
                error={state?.errors?.firstName}
                handleChange={(event) =>
                  handleMemberChange(event.target.value, 'firstName')
                }
              />
            </div>

            <div className="flex">
              <TextInput
                color={Color.ORANGE}
                className="mr-4"
                type="date"
                handleChange={handleBirthDate(setIsMinor)}
                label="Date de naissance *"
                idFor="birthDate"
                placeholder="JJ/MM/AAAA"
                settingKey="birthDate"
                error={state?.errors?.birthDate}
              />
              <RadioInput
                className="min-w-[100px] md:mt-0"
                color={Color.ORANGE}
                label="Sexe *"
                idFor="gender"
                settingKey="gender"
                options={genderOptions}
                defaultValue={member?.gender || genderOptions[0].value}
              />
            </div>
          </div>
        </div>

        <div className="w-full flex mt-2 items-end space-x-4">
          <TextInput
            className="flex-1"
            color={Color.ORANGE}
            label="Commune de naissance *"
            idFor="birthTown"
            settingKey="birthTown"
            error={state?.errors?.birthTown}
          />
          <TextInput
            className="flex-1"
            color={Color.ORANGE}
            label="Département de naissance *"
            idFor="birthDepartement"
            settingKey="birthDepartement"
            error={state?.errors?.birthDepartement}
          />
        </div>
        <TextInput
          color={Color.ORANGE}
          label="Nationalité *"
          idFor="nationality"
          settingKey="nationality"
          error={state?.errors?.nationality}
        />
        <p className="text-lg mb-2 font-semibold text-orange-medium">
          Coordonées de l'adhérent.e
        </p>
        <TextInput
          color={Color.ORANGE}
          label="Rue *"
          idFor="street"
          settingKey="street"
          error={state?.errors?.street}
        />
        <TextInput
          color={Color.ORANGE}
          label="Complément d'adresse"
          idFor="additionalAddressInformation"
          settingKey="additionalAddressInformation"
          error={state?.errors?.additionalAddressInformation}
        />
        <div className="w-full flex mt-2 items-end space-x-2">
          <TextInput
            color={Color.ORANGE}
            className="w-24 min-w-[70px]"
            type="number"
            label="Code postal *"
            idFor="zipCode"
            settingKey="zipCode"
            error={state?.errors?.zipCode}
          />
          <TextInput
            className="flex-grow"
            color={Color.ORANGE}
            label="Ville *"
            idFor="city"
            settingKey="city"
            error={state?.errors?.city}
          />
          <TextInput
            className="w-14 min-w-[40px]"
            color={Color.ORANGE}
            defaultValue="FR"
            label="Pays *"
            idFor="country"
            settingKey="country"
            error={state?.errors?.country}
          />
        </div>
        <div className="w-full flex mt-2 items-end space-x-4">
          <TextInput
            className="flex-1"
            color={Color.ORANGE}
            label="Téléphone principal*"
            idFor="phoneNumber"
            settingKey="phoneNumber"
            error={state?.errors?.phoneNumber}
          />
          <TextInput
            className="flex-1"
            color={Color.ORANGE}
            label="Téléphone secondaire"
            idFor="phoneNumber2"
            settingKey="phoneNumber2"
            error={state?.errors?.phoneNumber2}
          />
        </div>
        <TextInput
          color={Color.ORANGE}
          type="email"
          label="Email *"
          idFor="email"
          settingKey="email"
          error={state?.errors?.email}
        />
        {!isMinor ? (
          <p className="text-lg mb-2 font-semibold text-orange-medium">
            Personne à contacter en cas d'urgence
          </p>
        ) : (
          <p className="text-lg mb-2 font-semibold text-orange-medium">
            Coordonnées du représentant légal 1
          </p>
        )}
        <TextInput
          color={Color.ORANGE}
          idFor="contactLastName"
          label="Nom *"
          settingKey="contactLastName"
          error={state?.errors?.contactLastName}
          handleChange={(event) =>
            handleMemberChange(event.target.value, 'contactLastName')
          }
        />
        <TextInput
          color={Color.ORANGE}
          label="Prénom *"
          idFor="contactFirstName"
          settingKey="contactFirstName"
          error={state?.errors?.contactFirstName}
          handleChange={(event) =>
            handleMemberChange(event.target.value, 'contactFirstName')
          }
        />
        <div className="w-full flex mt-2 items-end space-x-4">
          <TextInput
            className="flex-1"
            color={Color.ORANGE}
            idFor="contactLink"
            label="Lien de parenté *"
            settingKey="contactLink"
            error={state?.errors?.contactLink}
          />
          <TextInput
            color={Color.ORANGE}
            className="flex-1"
            label="Numéro de téléphone *"
            idFor="contactPhoneNumber"
            settingKey="contactPhoneNumber"
            error={state?.errors?.contactPhoneNumber}
          />
        </div>

        {!isMinor ? null : (
          <TextInput
            color={Color.ORANGE}
            label="Email *"
            idFor="contactEmail"
            settingKey="contactEmail"
            error={state?.errors?.contactEmail}
          />
        )}
        {!isMinor ? null : (
          <div className="mb-4">
            <p className="text-lg mb-2 font-semibold text-orange-medium">
              Coordonnées du représentant légal 2
            </p>
            <TextInput
              color={Color.ORANGE}
              error={state?.errors?.contact2LastName}
              idFor="contact2LastName"
              label="Nom"
              settingKey="contact2LastName"
            />
            <TextInput
              color={Color.ORANGE}
              error={state.errors?.contact2FirstName}
              idFor="contact2FirstName"
              label="Prénom"
              settingKey="contact2FirstName"
            />
            <div className="w-full flex mt-2 items-end space-x-4">
              <TextInput
                className="flex-1"
                color={Color.ORANGE}
                idFor="contact2Link"
                label="Lien de parenté"
                settingKey="contact2Link"
                error={state?.errors?.contact2Link}
              />
              <TextInput
                className="flex-1"
                color={Color.ORANGE}
                error={state?.errors?.contact2PhoneNumber}
                idFor="contact2PhoneNumber"
                label="Numéro de téléphone"
                settingKey="contact2PhoneNumber"
              />
            </div>
            <TextInput
              color={Color.ORANGE}
              error={state?.errors?.contact2Email}
              idFor="contact2Email"
              label="Email"
              settingKey="contact2Email"
            />
          </div>
        )}
        <p className="text-lg mb-2 font-semibold text-orange-medium">
          Informations supplémentaire pour la saison {season.name}
        </p>
        {!isMinor ? (
          <p className="mb-4">
            J'autorise le club à prendre des photos et/ou à filmer à l'occasion
            des activités et compétitions sportives ou associatives auxquelles
            je participe et autorise leur publication dans le bulletin
            d'informations, la page facebook et sur le site internet du club à
            des fins pédagoqiques et non commerciales.
          </p>
        ) : (
          <p className="mb-4">
            <span className="font-semibold">
              {member?.contactFirstName} {member?.contactLastName}
            </span>{' '}
            responsable légal de l'enfant{' '}
            <span className="font-semibold">
              {member?.firstName} {member?.lastName}
            </span>{' '}
            autorise le club à prendre des photos et/ou à filmer mon enfant à
            l'occasion des activités et compétitions sportives ou associatives
            auxquelles il participe et autorise leur publication dans le
            bulletin d'informations, la page facebook et sur le site internet du
            club à des fins pédagoqiques et non commerciales.
          </p>
        )}
        <ToggleInput
          color={Color.ORANGE}
          checked={member?.isMediaCompliant ?? true}
          idFor="isMediaCompliant"
          handleChange={(e) =>
            handleMemberChange(e.target.checked, 'isMediaCompliant')
          }
          settingKey="isMediaCompliant"
        >
          <label
            htmlFor="isMediaCompliant"
            className="ml-4 mr flex items-center"
          >
            {member?.isMediaCompliant ? 'OUI' : 'NON'}
          </label>
        </ToggleInput>
        <div className="mt-8 flex">
          <Checkbox
            color={Color.ORANGE}
            idFor="attestation-checkbox"
            defaultValue={isCheckboxChecked}
            handleChange={handleCheckboxChange}
          />
          {!isMinor ? (
            <p className="ml-4">
              J'atteste avoir pris connaissance du réglèment intérieur remis par
              email avec les documents d'inscription.
            </p>
          ) : (
            <p className="ml-4">
              <span className="font-semibold">
                {member?.contactFirstName} {member?.contactLastName}
              </span>{' '}
              responsable légal de l'enfant{' '}
              <span className="font-semibold">
                {member?.firstName} {member?.lastName}
              </span>{' '}
              atteste avoir pris connaissance du réglèment intérieur remis par
              email avec les documents d'inscription.
            </p>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            type="submit"
            color={Color.ORANGE}
            disabled={isSubmitting || !isCheckboxChecked}
          >
            {isSubmitting ? 'Traitement en cours...' : 'ENVOYER'}
          </Button>
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
