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
import { RadioInput } from '../common/radioInput';
import { ProfileImage } from '../common/profilImage';
import { SelectInput } from '../common/selectInput';
import { useSearchParams } from 'next/navigation';

interface FormProps {
  dispatch: (payload: FormData) => Promise<ClimbingState>;
  member?: Member;
  state: ClimbingState;
}

const optionsToSelect = [
  { label: 'Ski', value: 'skiOption' },
  { label: 'Slackline', value: 'slacklineOption' },
  { label: 'Trail', value: 'trailRunningOption' },
  { label: 'VTT', value: 'mountainBikingOption' },
];

export default function Form({ state, dispatch, member }: FormProps) {
  const searchParams = useSearchParams();
  const seasonId = searchParams.get('seasonId');

  const [picture, setPicture] = useState<File | string | null>(
    member?.picture || null,
  );
  const [pictureUrl, setPictureUrl] = useState<string | null>(
    member?.picture || null,
  );

  const [gender, setGender] = useState(member?.gender ?? 'F');
  const [isMinor, setIsMinor] = useState(false);
  const [birthDate, setBirthDate] = useState(member?.birthDate || '');
  const [assaultProtection, setAssaultProtection] = useState(
    member?.assaultProtectionOption ?? false,
  );
  const [hasPaid, setHasPaid] = useState(member?.hasPaid ?? false);
  const [isMediaCompliant, setIsMediaCompliant] = useState(
    member?.isMediaCompliant ?? false,
  );

  const [licenseType, setLicenseType] = useState(() => {
    if (member?.licenseType) {
      return member.licenseType;
    }
    return isMinor ? 'J' : 'A';
  });
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [insurance, setInsurance] = useState(member?.insurance ?? 'RC');
  const [supplementalInsurance, setSupplementalInsurance] = useState(
    member?.supplementalInsurance ?? 'NON',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayToast, setDisplayToast] = useState(false);

  const handlePictureChange = (file: File) => {
    setPicture(file);
    // url locale pour la prévisualisation en attendant l'envoie du formulaire
    const url = URL.createObjectURL(file);
    setPictureUrl(url);
  };

  const formatTimestamp = (date?: string) => {
    return date ? String(dayjs(date).format('YYYY-MM-DD')) : '';
  };

  useEffect(() => {
    if (member?.birthDate) {
      const formattedBirthDate = dayjs(member.birthDate).format('YYYY-MM-DD');
      const birthDateEvent = {
        target: { value: formattedBirthDate },
      };
      handleBirthDate(setIsMinor)(birthDateEvent as any);
    }
  }, [member]);

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value);
    handleBirthDate(setIsMinor)(e);
  };

  const handleGender = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGender(event.target.value);
  };

  const handleLicenseType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseType(event.target.value);
  };

  useEffect(() => {
    setLicenseType(member?.licenseType ?? (isMinor ? 'J' : 'A'));
  }, [member, isMinor]);

  const handleOptionsChange = (values: { [key: string]: boolean }) => {
    setSelectedOptions(values);
  };
  const handleInsurance = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInsurance(event.target.value);
  };

  const handleSupplementalInsurance = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSupplementalInsurance(event.target.value);
  };
  const handleAssaultProtection = () => {
    setAssaultProtection((prevState) => !prevState);
  };
  const handleHasPaid = () => {
    setHasPaid((prevState) => !prevState);
  };

  const handleIsMediaCompliant = () => {
    setIsMediaCompliant((prevState) => !prevState);
  };

  // Conversion valeurs du formulaire au bon format avant envoi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    if (picture) formData.set('picture', picture);

    for (const [key, value] of Object.entries(selectedOptions)) {
      formData.set(key, value.toString());
    }
    formData.set('assaultProtectionOption', assaultProtection.toString());
    formData.set('isMediaCompliant', isMediaCompliant.toString());
    formData.set('hasPaid', hasPaid.toString());

    try {
      await dispatch(formData);
      setDisplayToast(true);
    } catch (error) {
      console.error('Erreur lors de l’envoi du formulaire', error);
    } finally {
      setIsSubmitting(false);
    }
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
        window.location.href = `/dashboard/climbing?seasonId=${seasonId}`; // Redirection côté client
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.isSuccess]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <p className="text-xl mb-4 text-blue-medium">
              Informations sur l'adhérent.ee
            </p>
            <div className="flex items-start">
              {pictureUrl ? (
                <ProfileImage
                  idFor="picture"
                  settingKey="picture"
                  imageUrl={pictureUrl}
                  handlePictureChange={handlePictureChange}
                  error={state?.errors?.picture}
                  member={member}
                />
              ) : (
                <PictureUpload
                  handleChange={handlePictureChange}
                  idFor="picture"
                  settingKey="picture"
                  error={state?.errors?.picture}
                />
              )}
              <div className="ml-4 flex-grow">
                <TextInput
                  defaultValue={member?.lastName}
                  idFor="lastName"
                  label="Nom"
                  settingKey="lastName"
                  error={state?.errors?.lastName}
                />
                <TextInput
                  defaultValue={member?.firstName}
                  label="Prénom"
                  idFor="firstName"
                  settingKey="firstName"
                  error={state?.errors?.firstName}
                />
                <div className="w-full flex">
                  <TextInput
                    defaultValue={formatTimestamp(member?.birthDate)}
                    handleChange={handleBirthDateChange}
                    label="Date de naissance"
                    idFor="birthDate"
                    placeholder="JJ/MM/AAAA"
                    settingKey="birthDate"
                    type="date"
                    error={state?.errors?.birthDate}
                  />
                  <RadioInput
                    className="ml-8"
                    label="Sexe"
                    idFor="gender"
                    settingKey="gender"
                    options={[
                      { label: 'F', value: 'F' },
                      { label: 'H', value: 'M' },
                    ]}
                    defaultValue="F"
                    value={gender}
                    onChange={handleGender}
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex mt-2">
              <TextInput
                className="flex-1"
                defaultValue={member?.birthTown}
                label="Commune de naissance"
                idFor="birthTown"
                settingKey="birthTown"
                error={state?.errors?.birthTown}
              />
              <TextInput
                className="flex-1 mx-2"
                defaultValue={member?.birthDepartement}
                label="Département de naissance"
                idFor="birthDepartement"
                settingKey="birthDepartement"
                error={state?.errors?.birthDepartement}
              />
              <TextInput
                className="flex-1"
                defaultValue={member?.nationality}
                label="Nationalité"
                idFor="nationality"
                settingKey="nationality"
                error={state?.errors?.nationality}
              />
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xl mb-4 text-blue-medium">
              Coordonées de l'adhérent.e
            </p>
            <TextInput
              defaultValue={member?.street}
              label="Rue"
              idFor="street"
              settingKey="street"
              error={state?.errors?.street}
            />
            <TextInput
              defaultValue={member?.additionalAddressInformation}
              label="Complément d'adresse"
              idFor="additionalAddressInformation"
              settingKey="additionalAddressInformation"
              error={state?.errors?.additionalAddressInformation}
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
                className="ml-2 flex-1"
                defaultValue={member?.city}
                label="Ville"
                idFor="city"
                settingKey="city"
                error={state?.errors?.city}
              />
              <TextInput
                className="ml-2 w-12"
                defaultValue={member?.country || 'FR'}
                label="Pays"
                idFor="country"
                settingKey="country"
                error={state?.errors?.country}
              />
            </div>
            <div className="w-full flex">
              <TextInput
                className="flex-1"
                defaultValue={member?.phoneNumber}
                label="Téléphone portable"
                idFor="phoneNumber"
                settingKey="phoneNumber"
                error={state?.errors?.phoneNumber}
              />
              <TextInput
                className="ml-2 flex-1"
                defaultValue={member?.phoneNumber2}
                label="Téléphone fixe"
                idFor="phoneNumber2"
                settingKey="phoneNumber2"
                error={state?.errors?.phoneNumber2}
              />
            </div>
            <TextInput
              defaultValue={member?.email}
              label="Email"
              idFor="email"
              settingKey="email"
              error={state?.errors?.email}
            />
          </div>
          <div className="mb-4">
            {!isMinor ? (
              <p className="text-xl mb-4 text-blue-medium">
                Personne à contacter en cas d'urgence
              </p>
            ) : (
              <p className="text-xl mb-4 text-blue-medium">
                Coordonnées du représentant légal 1
              </p>
            )}
            <TextInput
              defaultValue={member?.contactLink}
              idFor="contactLink"
              label="Lien de parenté"
              settingKey="contactLink"
              error={state?.errors?.contactLink}
            />
            <TextInput
              defaultValue={member?.contactLastName}
              idFor="contactLastName"
              label="Nom"
              settingKey="contactLastName"
              error={state?.errors?.contactLastName}
            />
            <TextInput
              defaultValue={member?.contactFirstName}
              label="Prénom"
              idFor="contactFirstName"
              settingKey="contactFirstName"
              error={state?.errors?.contactFirstName}
            />
            <TextInput
              defaultValue={member?.contactPhoneNumber}
              label="Numéro de téléphone"
              idFor="contactPhoneNumber"
              settingKey="contactPhoneNumber"
              error={state?.errors?.contactPhoneNumber}
            />
            {!isMinor ? null : (
              <TextInput
                defaultValue={member?.contactEmail}
                label="Email"
                idFor="contactEmail"
                settingKey="contactEmail"
                error={state?.errors?.contactEmail}
              />
            )}
          </div>
          {!isMinor ? null : (
            <div className="mb-4">
              <p className="text-xl mb-4 text-blue-medium">
                Coordonnées du représentant légal 2
              </p>
              <TextInput
                defaultValue={member?.contact2Link}
                idFor="contact2Link"
                label="Lien de parenté"
                settingKey="contact2Link"
                error={state?.errors?.contact2Link}
              />
              <TextInput
                defaultValue={member?.contact2LastName}
                error={state?.errors?.contact2LastName}
                idFor="contact2LastName"
                label="Nom"
                settingKey="contact2LastName"
              />
              <TextInput
                defaultValue={member?.contact2FirstName}
                error={state.errors?.contact2FirstName}
                idFor="contact2FirstName"
                label="Prénom"
                settingKey="contact2FirstName"
              />
              <TextInput
                defaultValue={member?.contact2PhoneNumber}
                error={state?.errors?.contact2PhoneNumber}
                idFor="contact2PhoneNumber"
                label="Numéro de téléphone"
                settingKey="contact2PhoneNumber"
              />
              <TextInput
                defaultValue={member?.contact2Email}
                error={state?.errors?.contact2Email}
                idFor="contact2Email"
                label="Email"
                settingKey="contact2Email"
              />
            </div>
          )}
          <div className="mt-4">
            <p className="text-xl mb-4 text-blue-medium">
              Informations et choix de l'adhérent.e pour la saison
            </p>
            <div className="flex">
              <TextInput
                className="flex-1"
                defaultValue={member?.license}
                label="Licence"
                idFor="license"
                settingKey="license"
              />
              <RadioInput
                className="ml-8"
                label="Type de licence"
                idFor="licenseType"
                settingKey="licenseType"
                options={[
                  { label: 'Jeune', value: 'J' },
                  { label: 'Adulte', value: 'A' },
                  { label: 'Famille', value: 'F' },
                ]}
                value={licenseType}
                onChange={handleLicenseType}
              />
            </div>
            <SelectInput
              title="Options supplémentaires souhaitées"
              options={optionsToSelect}
              onChange={handleOptionsChange}
            />
            <div className="flex mt-8">
              <RadioInput
                className="flex-1"
                label="Assurance"
                idFor="insurance"
                settingKey="insurance"
                options={[
                  { label: 'RC', value: 'RC' },
                  { label: 'B', value: 'B' },
                  { label: 'B+', value: 'B+' },
                  { label: 'B++', value: 'B++' },
                ]}
                defaultValue="RC"
                value={insurance}
                onChange={handleInsurance}
              />
              <RadioInput
                className="flex-1 mx-8"
                label="Assurance complémentaire"
                idFor="supplementalInsurance"
                settingKey="supplementalInsurance"
                options={[
                  { label: 'NON', value: 'NON' },
                  { label: 'IJ1', value: 'IJ1' },
                  { label: 'IJ2', value: 'IJ2' },
                  { label: 'IJ3', value: 'IJ3' },
                ]}
                defaultValue="NON"
                value={supplementalInsurance}
                onChange={handleSupplementalInsurance}
              />
              <ToggleInput
                className="flex-1"
                defaultValue={assaultProtection}
                handleChange={handleAssaultProtection}
                idFor="assaultProtectionOption"
                label="Option protection agression"
                settingKey="assaultProtectionOption"
              >
                <label
                  htmlFor="assaultProtectionOption"
                  className="ml-4 mr flex items-center"
                >
                  {assaultProtection ? 'Oui' : 'Non'}
                </label>
              </ToggleInput>
            </div>
            <ToggleInput
              className="mt-4"
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
            <ToggleInput
              className="mt-8"
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
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link
            href={`/dashboard/climbing?seasonId=${seasonId}`}
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Annuler
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Traitement en cours...'
              : member
                ? 'Editer membre'
                : 'Créer membre'}
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
