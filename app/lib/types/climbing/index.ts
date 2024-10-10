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

export interface ContactDB {
  id: string;
  link: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

export interface Member_Section_SeasonDB {
  section_id: string;
  season_id: string;
  member_id: string;
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

export interface Member_ContactDB {
  member_id: string;
  first_contact_id: string;
  second_contact_id: string;
}

export interface MemberSeasonDB extends MemberDB {
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

// export interface MemberWithContactsAndSeasonBD extends MemberDB {
//   // Season informations
//   license: string;
//   license_type: string;
//   insurance: string;
//   supplemental_insurance: string;
//   assault_protection_option: boolean;
//   ski_option: boolean;
//   slackline_option: boolean;
//   trail_running_option: boolean;
//   mountain_biking_option: boolean;
//   is_media_compliant: boolean;
//   has_paid: boolean;
//   // Contacts informations
//   first_contact_id: string;
//   contact_link: string;
//   contact_first_name: string;
//   contact_last_name: string;
//   contact_phone_number: string;
//   contact_email: string;
//   second_contact_id?: string;
//   contact2_link?: string;
//   contact2_first_name?: string;
//   contact2_last_name?: string;
//   contact2_phone_number?: string;
//   contact2_email?: string;
// }

export interface MemberWithContactsAndSeasonBD extends MemberWithContactsDB {
  // Season informations
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
