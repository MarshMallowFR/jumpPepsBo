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
import { MemberRegistrationForm } from '@/app/lib/types/climbing';

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
  const initialState: MemberRegistrationForm = {
    contactFirstName: null,
    contactLastName: null,
    firstName: null,
    gender: null,
    isMediaCompliant: true,
    lastName: null,
    picture: null,
    pictureUrl: null,
  };

  const [member, setMember] = useState<MemberRegistrationForm>(initialState);
  const [isMinor, setIsMinor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayToast, setDisplayToast] = useState(false);

  const currentDate = new Date();
  const formatedCurrentDate = `${currentDate
    .getDate()
    .toString()
    .padStart(2, '0')}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${currentDate.getFullYear()}`;

  const handleMemberChange = (
    value: string | boolean | null,
    key: keyof MemberRegistrationForm,
  ) => {
    setMember((oldMemberValues) => ({
      ...oldMemberValues,
      [key]: value,
    }));
  };

  const handleIsMediaCompliant = () => {
    setMember((oldMemberValues) => ({
      ...oldMemberValues,
      isMediaCompliant: !oldMemberValues.isMediaCompliant,
    }));
  };

  const handlePictureChange = (file: File) => {
    const url = URL.createObjectURL(file); // url locale pour la prévisualisation en attendant l'envoie du formulaire
    setMember((oldMemberValues) => ({
      ...oldMemberValues,
      picture: file,
      pictureUrl: url,
    }));
  };

  // Conversion valeurs du formulaire au bon format avant envoi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set('isMediaCompliant', member.isMediaCompliant.toString());

    if (member.picture) {
      formData.set('picture', member.picture);
    }
    try {
      await dispatch(formData);
      setDisplayToast(true);
    } catch (error) {
      console.error('Erreur lors de l’envoi du formulaire', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remise à zéro des champs du formulaire si tout est OK
  useEffect(() => {
    if (state?.isSuccess) {
      setMember(initialState);
      setIsMinor(false);
      const form = document.querySelector('form');
      if (form) {
        form.reset();
      }
    }
  }, [state?.isSuccess]);

  useEffect(() => {
    return () => {
      if (member.pictureUrl) {
        URL.revokeObjectURL(member.pictureUrl);
      }
    };
  }, [member.pictureUrl]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-md shadow-custom-shadow bg-gray p-8 min-w-0 w-full md:w-1/2"
      >
        <div>
          <h2 className="text-xl font-bold">GRIMP PEP'S</h2>
          <h2 className="text-xl font-bold mb-4">
            Formulaire d'inscription {season.name}
          </h2>
        </div>
        <p className="text-lg mb-2 font-semibold text-orange-medium">
          Informations sur l'adhérent.e
        </p>
        <div className="flex items-start">
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
            imageUrl={member.pictureUrl ?? undefined}
            error={state?.errors?.picture}
          />
          <div className="ml-6 flex-grow">
            <TextInput
              color={Color.ORANGE}
              idFor="lastName"
              label="Nom"
              settingKey="lastName"
              error={state?.errors?.lastName}
              handleChange={(event) =>
                handleMemberChange(event.target.value, 'lastName')
              }
            />
            <TextInput
              color={Color.ORANGE}
              label="Prénom"
              idFor="firstName"
              settingKey="firstName"
              error={state?.errors?.firstName}
              handleChange={(event) =>
                handleMemberChange(event.target.value, 'firstName')
              }
            />
            <div className="w-full flex">
              <TextInput
                color={Color.ORANGE}
                type="date"
                handleChange={handleBirthDate(setIsMinor)}
                label="Date de naissance"
                idFor="birthDate"
                placeholder="JJ/MM/AAAA"
                settingKey="birthDate"
                error={state?.errors?.birthDate}
              />
              <RadioInput
                className="ml-8"
                color={Color.ORANGE}
                label="Sexe"
                idFor="gender"
                settingKey="gender"
                options={[
                  { label: 'F', value: 'F' },
                  { label: 'H', value: 'M' },
                ]}
                value={member.gender ?? 'F'}
                onChange={(event) =>
                  handleMemberChange(event.target.value, 'gender')
                }
              />
            </div>
          </div>
        </div>
        <div className="w-full flex mt-2">
          <TextInput
            className="flex-1"
            color={Color.ORANGE}
            label="Commune de naissance"
            idFor="birthTown"
            settingKey="birthTown"
            error={state?.errors?.birthTown}
          />
          <TextInput
            className="flex-1 mx-2"
            color={Color.ORANGE}
            label="Département de naissance"
            idFor="birthDepartement"
            settingKey="birthDepartement"
            error={state?.errors?.birthDepartement}
          />
          <TextInput
            className="flex-1"
            color={Color.ORANGE}
            label="Nationalité"
            idFor="nationality"
            settingKey="nationality"
            error={state?.errors?.nationality}
          />
        </div>
        <p className="text-lg mb-2 font-semibold text-orange-medium">
          Coordonées de l'adhérent.e
        </p>
        <TextInput
          color={Color.ORANGE}
          label="Rue"
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
        <div className="w-full flex">
          <TextInput
            color={Color.ORANGE}
            type="number"
            label="Code postal"
            idFor="zipCode"
            settingKey="zipCode"
            error={state?.errors?.zipCode}
          />
          <TextInput
            className="ml-2 flex-1"
            color={Color.ORANGE}
            label="Ville"
            idFor="city"
            settingKey="city"
            error={state?.errors?.city}
          />
          <TextInput
            className="ml-2 w-12"
            color={Color.ORANGE}
            defaultValue="FR"
            label="Pays"
            idFor="country"
            settingKey="country"
            error={state?.errors?.country}
          />
        </div>
        <div className="flex">
          <TextInput
            className="flex-1"
            color={Color.ORANGE}
            label="Téléphone portable"
            idFor="phoneNumber"
            settingKey="phoneNumber"
            error={state?.errors?.phoneNumber}
          />
          <TextInput
            className="ml-2 flex-1"
            color={Color.ORANGE}
            label="Téléphone fixe"
            idFor="phoneNumber2"
            settingKey="phoneNumber2"
            error={state?.errors?.phoneNumber2}
          />
        </div>
        <TextInput
          color={Color.ORANGE}
          type="email"
          label="Email"
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
          label="Nom"
          settingKey="contactLastName"
          error={state?.errors?.contactLastName}
          handleChange={(event) =>
            handleMemberChange(event.target.value, 'contactLastName')
          }
        />
        <TextInput
          color={Color.ORANGE}
          label="Prénom"
          idFor="contactFirstName"
          settingKey="contactFirstName"
          error={state?.errors?.contactFirstName}
          handleChange={(event) =>
            handleMemberChange(event.target.value, 'contactFirstName')
          }
        />
        <div className="flex">
          <TextInput
            className="basis-1/2"
            color={Color.ORANGE}
            idFor="contactLink"
            label="Lien de parenté"
            settingKey="contactLink"
            error={state?.errors?.contactLink}
          />
          <TextInput
            color={Color.ORANGE}
            className="ml-2 basis-1/2"
            label="Numéro de téléphone"
            idFor="contactPhoneNumber"
            settingKey="contactPhoneNumber"
            error={state?.errors?.contactPhoneNumber}
          />
        </div>

        {!isMinor ? null : (
          <TextInput
            color={Color.ORANGE}
            label="Email"
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
            <div className="flex">
              <TextInput
                className="basis-1/2"
                color={Color.ORANGE}
                idFor="contact2Link"
                label="Lien de parenté"
                settingKey="contact2Link"
                error={state?.errors?.contact2Link}
              />
              <TextInput
                className="ml-2 basis-1/2"
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
            Je soussigné(e){' '}
            <span className="font-semibold">
              {member.firstName} {member.lastName}
            </span>{' '}
            autorise le club à prendre des photos et/ou à filmer à l'occasion
            des activités et compétitions sportives ou associatives auxquelles
            je participe et autorise leur publication dans le bulletin
            d'informations, la page facebook et sur le site internet du club à
            des fins pédagoqiques et non commerciales.
          </p>
        ) : (
          <p className="mb-4">
            Je soussigné(e){' '}
            <span className="font-semibold">
              {member.contactFirstName} {member.contactLastName}
            </span>{' '}
            responsable légal de l'enfant{' '}
            <span className="font-semibold">
              {member.firstName} {member.lastName}
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
          defaultValue={member.isMediaCompliant}
          idFor="isMediaCompliant"
          handleChange={handleIsMediaCompliant}
          settingKey="isMediaCompliant"
        >
          <label
            htmlFor="isMediaCompliant"
            className="ml-4 mr flex items-center"
          >
            {member.isMediaCompliant ? 'OUI' : 'NON'}
          </label>
        </ToggleInput>
        {!isMinor ? (
          <p className="mt-8">
            {' '}
            Je soussigné(e){' '}
            <span className="font-semibold">
              {member.firstName} {member.lastName}
            </span>{' '}
            atteste avoir pris connaissance du réglèment intérieur remis par
            email avec les documents d'inscription.
          </p>
        ) : (
          <p className="mt-8">
            {' '}
            Je soussigné(e){' '}
            <span className="font-semibold">
              {member.contactFirstName} {member.contactLastName}
            </span>{' '}
            responsable légal de l'enfant{' '}
            <span className="font-semibold">
              {member.firstName} {member.lastName}
            </span>{' '}
            atteste avoir pris connaissance du réglèment intérieur remis par
            email avec les documents d'inscription.
          </p>
        )}
        <div className="mt-8 flex font-semibold justify-between">
          <p>
            Lu et approuvé le{' '}
            <span className="font-normal">{formatedCurrentDate}</span>
          </p>
          <div className="flex">
            <p>Signature</p>
            <svg className="ml-2 w-40 h-16 border border-gray-400 rounded-lg" />
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button type="submit" color={Color.ORANGE} disabled={isSubmitting}>
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
