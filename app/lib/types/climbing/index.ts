export interface MemberDB {
  id: string;
  picture: string;
  last_name: string;
  first_name: string;
  birth_date: string;
  gender: string;
  nationality: string;
  street: string;
  additional_address_information: string;
  zip_code: string;
  city: string;
  country: string;
  email: string;
  phone_number: string;
  phone_number2: string;
  birth_town: string;
  birth_departement: string;
}

export interface MemberWithContactsDB extends MemberDB {
  first_contact_id: string;
  contact_link: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_phone_number: string;
  contact_email: string;
  second_contact_id?: string;
  contact2_link?: string;
  contact2_first_name?: string;
  contact2_last_name?: string;
  contact2_phone_number?: string;
  contact2_email?: string;
}

export interface MemberWithContactsAndSeasonBD extends MemberWithContactsDB {
  license: string;
  license_type: string;
  insurance: string;
  supplemental_insurance: string;
  assault_protection_option: boolean;
  ski_option: boolean;
  slackline_option: boolean;
  trail_running_option: boolean;
  mountain_biking_option: boolean;
  is_media_compliant: boolean;
  has_paid: boolean;
}

export interface Member {
  id: string;
  picture: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  gender: string;
  nationality: string;
  street: string;
  additionalAddressInformation: string;
  zipCode: string;
  city: string;
  country: string;
  email: string;
  phoneNumber: string;
  phoneNumber2: string;
  birthTown: string;
  birthDepartement: string;
  contactLink: string;
  contactLastName: string;
  contactFirstName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  contact2Id?: string;
  contact2Link?: string;
  contact2FirstName?: string;
  contact2LastName?: string;
  contact2PhoneNumber?: string;
  contact2Email?: string;
}

export interface MemberWithSeason extends Member {
  license: string;
  licenseType: string;
  insurance: string;
  supplementalInsurance: string;
  assaultProtectionOption: boolean;
  skiOption: boolean;
  slacklineOption: boolean;
  trailRunningOption: boolean;
  mountainBikingOption: boolean;
  isMediaCompliant: boolean;
  hasPaid: boolean;
}

export interface MemberRegistrationForm {
  contactFirstName: string | null;
  contactLastName: string | null;
  firstName: string | null;
  gender: string | null;
  isMediaCompliant: boolean;
  lastName: string | null;
  picture: File | string | null;
  pictureUrl: string | null;
}

export interface MemberForm {
  assaultProtection: boolean;
  birthDate: string | null;
  gender: string | null;
  hasPaid: boolean;
  insurance: string;
  isMediaCompliant: boolean;
  licenseType: string | null;
  picture: File | string | null;
  pictureUrl: string | null;
  supplementalInsurance: string;
  //Options to select
  skiOption: boolean;
  slacklineOption: boolean;
  trailRunningOption: boolean;
  mountainBikingOption: boolean;
}

// const initialState: MemberForm = {
//   assaultProtection: member?.assaultProtectionOption ?? false,
//   birthDate: member?.birthDate || '',
//   gender: member?.gender ?? 'F',
//   hasPaid: member?.hasPaid ?? false,
//   insurance: member?.insurance ?? 'RC',
//   isMediaCompliant: member?.isMediaCompliant ?? false,
//   licenseType: member?.licenseType ?? (isMinor ? 'J' : 'A'), // A voir ensemble ce radioInput
//   picture: member?.picture || null,
//   pictureUrl: member?.picture || null,
//   supplementalInsurance: member?.supplementalInsurance ?? 'NON',
//   // selectedOptions: member?.selectedOptions || {},
// };
