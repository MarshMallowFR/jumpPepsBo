import { Dispatch, SetStateAction, ChangeEvent } from 'react';

export const handleBirthDate =
  (setIsMinor: Dispatch<SetStateAction<boolean>>) =>
  (e: ChangeEvent<HTMLInputElement>) => {
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

export const optionsToSelect = [
  { label: 'Ski', value: 'skiOption' },
  { label: 'Slackline', value: 'slacklineOption' },
  { label: 'Trail', value: 'trailRunningOption' },
  { label: 'VTT', value: 'mountainBikingOption' },
];

export const genderOptions = [
  { label: 'F', value: 'F' },
  { label: 'H', value: 'M' },
];

export const licenseTypeOptions = [
  { label: 'Jeune', value: 'J' },
  { label: 'Adulte', value: 'A' },
  { label: 'Famille', value: 'F' },
];

export const insuranceOptions = [
  { label: 'RC', value: 'RC' },
  { label: 'B', value: 'B' },
  { label: 'B+', value: 'B+' },
  { label: 'B++', value: 'B++' },
];

export const supplementalInsuranceOptions = [
  { label: 'NON', value: 'NON' },
  { label: 'IJ1', value: 'IJ1' },
  { label: 'IJ2', value: 'IJ2' },
  { label: 'IJ3', value: 'IJ3' },
];
