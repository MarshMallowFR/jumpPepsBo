import { MemberOptions } from '../lib/types/climbing';

export const optionsToSelect: { label: string; value: keyof MemberOptions }[] =
  [
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
