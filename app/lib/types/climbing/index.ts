export interface MemberDB {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  email: string;
  phone_number: string;
  street: string;
  zip_code: string;
  city: string;
  picture: string;
  is_media_compliant: boolean;
  has_paid: boolean;
  legal_contact_id?: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  street: string;
  zipCode: string;
  city: string;
  picture: string;
  isMediaCompliant: boolean;
  hasPaid: boolean;
  legalContactId?: string;
  legalContactFirstName?: string;
  legalContactLastName?: string;
  legalContactPhoneNumber?: string;
}

export interface LegalContactDB {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}
