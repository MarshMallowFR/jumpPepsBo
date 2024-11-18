import dayjs from 'dayjs';
import { ChangeEvent, useEffect, useState } from 'react';
import { ClimbingState } from '@/app/lib/actions/climbing/actions';
import {
  CheckIcon,
  ClockIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Member, MemberOptions } from '@/app/lib/types/climbing';
import { Button } from '../common/buttons';
import { TextInput } from '../common/textInput';
import { ToggleInput } from '../common/toggleInput';

import { handleBirthDate } from '../../utils/handleBirthday';
import {
  optionsToSelect,
  genderOptions,
  licenseTypeOptions,
  insuranceOptions,
  supplementalInsuranceOptions,
} from '../../utils/formOptions';
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

export default function Form({ state, dispatch, member }: FormProps) {
  const searchParams = useSearchParams();
  const seasonId = searchParams.get('seasonId');
  const [pictureFile, setPictureFile] = useState<File | null>(null);

  const [isMinor, setIsMinor] = useState(false);
  const [memberInput, setMemberInput] = useState<Partial<Member> | undefined>(
    member,
  );

  const defaultOptonsValues = (
    memberInput: Partial<Member> | undefined,
    options: { label: string; value: keyof MemberOptions }[],
  ) => {
    return options.reduce(
      (acc, { value }) => {
        acc[value] = memberInput?.[value] ?? false; // Par défaut false si undefined
        return acc;
      },
      {} as { [key: string]: boolean },
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayToast, setDisplayToast] = useState(false);

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

  useEffect(() => {
    setMemberInput((prev) => ({
      ...prev,
      licenseType: member?.licenseType ?? (isMinor ? 'J' : 'A'),
    }));
  }, [member, isMinor]);

  // Pour nettoyer l'URL de l'image lorsqu'elle n'est plus nécessaire
  useEffect(() => {
    return () => {
      if (memberInput?.picture) {
        URL.revokeObjectURL(memberInput.picture);
      }
    };
  }, [memberInput?.picture]);

  // Redirection vers dashboard après un délai en cas de succès (pas nécessaire pour bouton annuler)
  useEffect(() => {
    if (state?.isSuccess && seasonId) {
      // pour update on revient sur les membres de la saison
      const timer = setTimeout(() => {
        window.location.href = `/dashboard/climbing?seasonId=${seasonId}`;
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state?.isSuccess) {
      // pour creation la seasonId n'est pas sélectionnée
      const timer = setTimeout(() => {
        window.location.href = `/dashboard/climbing`;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.isSuccess]);

  const handleMemberChange = (
    value: string | boolean | null,
    key: keyof Member,
  ) => {
    setMemberInput((oldMemberValues) => ({
      ...(oldMemberValues ? oldMemberValues : {}),
      [key]: value,
    }));

    if (key === 'birthDate' && typeof value === 'string') {
      handleBirthDate(setIsMinor)({
        target: { value },
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleOptionsChange = (values: { [key: string]: boolean }) => {
    setMemberInput((prevInput) => ({
      ...prevInput,
      ...values,
    }));
  };

  const handlePictureChange = (file: File) => {
    const url = URL.createObjectURL(file); // Créer une URL temporaire pour la prévisualisation
    setPictureFile(file);
    setMemberInput((oldMemberValues) => ({
      ...oldMemberValues,
      picture: url,
    }));
  };

  // Conversion valeurs du formulaire au bon format avant envoi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    if (pictureFile) {
      formData.set('picture', pictureFile);
    } else if (memberInput?.picture) {
      formData.set('picture', memberInput.picture);
    }
    formData.set(
      'assaultProtectionOption',
      memberInput?.assaultProtectionOption?.toString() || '',
    );
    formData.set('hasPaid', memberInput?.hasPaid?.toString() || '');
    formData.set(
      'isMediaCompliant',
      memberInput?.isMediaCompliant?.toString() || '',
    );
    formData.set('skiOption', memberInput?.skiOption?.toString() || '');
    formData.set(
      'slacklineOption',
      memberInput?.slacklineOption?.toString() || '',
    );
    formData.set(
      'trailRunningOption',
      memberInput?.trailRunningOption?.toString() || '',
    );
    formData.set(
      'mountainBikingOption',
      memberInput?.mountainBikingOption?.toString() || '',
    );
    //Ne fonctionne pas. Tester pour avoir moins de formData.set =>
    // Object.entries(memberInput || {}).forEach(([key, value]) => {
    //   formData.set(key, value?.toString() || ''); // Transformez les booléens en string
    // });
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
      <form onSubmit={handleSubmit}>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <p className="text-xl mb-4 text-blue-medium">
              Informations sur l'adhérent.ee
            </p>
            <div className="flex items-start">
              {memberInput?.picture ? (
                <ProfileImage
                  idFor="picture"
                  settingKey="picture"
                  imageUrl={memberInput.picture}
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
                    handleChange={(e) =>
                      handleMemberChange(e.target.value, 'birthDate')
                    }
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
                    options={genderOptions}
                    defaultValue={memberInput?.gender || genderOptions[0].value}
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex mt-2 items-end">
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
            <div className="mb-4 w-full flex items-end">
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
                options={licenseTypeOptions}
                defaultValue={memberInput?.licenseType || (isMinor ? 'J' : 'A')}
                handleChange={(e) =>
                  handleMemberChange(e.target.value, 'licenseType')
                }
              />
            </div>
            <SelectInput
              defaultValues={defaultOptonsValues(memberInput, optionsToSelect)}
              onChange={handleOptionsChange}
              options={optionsToSelect}
              title="Options supplémentaires souhaitées"
            />
            <div className="flex mt-8">
              <RadioInput
                className="flex-1"
                label="Assurance"
                idFor="insurance"
                settingKey="insurance"
                options={insuranceOptions}
                defaultValue={
                  memberInput?.insurance || insuranceOptions[0].value
                }
              />
              <RadioInput
                className="flex-1 mx-8"
                label="Assurance complémentaire"
                idFor="supplementalInsurance"
                settingKey="supplementalInsurance"
                options={supplementalInsuranceOptions}
                defaultValue={
                  memberInput?.supplementalInsurance ||
                  supplementalInsuranceOptions[0].value
                }
              />
              <ToggleInput
                className="flex-1"
                checked={memberInput?.assaultProtectionOption || false}
                handleChange={(e) =>
                  handleMemberChange(
                    e.target.checked,
                    'assaultProtectionOption',
                  )
                }
                idFor="assaultProtectionOption"
                label="Option protection agression"
                settingKey="assaultProtectionOption"
              >
                <label
                  htmlFor="assaultProtectionOption"
                  className="ml-4 mr flex items-center"
                >
                  {memberInput?.assaultProtectionOption ? 'Oui' : 'Non'}
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
              checked={memberInput?.isMediaCompliant || false}
              handleChange={(e) =>
                handleMemberChange(e.target.checked, 'isMediaCompliant')
              }
              idFor="isMediaCompliant"
              label="Autorisation média"
              settingKey="isMediaCompliant"
            >
              <label
                htmlFor="isMediaCompliant"
                className="ml-4 mr flex items-center"
              >
                {memberInput?.isMediaCompliant ? 'Accepte' : 'Refuse'}
                {memberInput?.isMediaCompliant ? (
                  <CheckIcon className="h-4 w-4 ml-2 text-green-600 font-bold" />
                ) : (
                  <XMarkIcon className="h-4 w-4 ml-2 text-red-600" />
                )}
              </label>
            </ToggleInput>
            <ToggleInput
              className="mt-8"
              checked={memberInput?.hasPaid || false}
              handleChange={(e) =>
                handleMemberChange(e.target.checked, 'hasPaid')
              }
              idFor="hasPaid"
              label="Statut du paiement"
              settingKey="hasPaid"
            >
              <label className="ml-4 mr flex items-center">
                Payé{' '}
                {memberInput?.hasPaid ? (
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
