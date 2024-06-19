'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

const ClimbingMemberSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string(),
  email: z.string(),
  phoneNumber: z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value.trim().replace(/\s+/g, '');
  }, z.string().length(10)),
  street: z.string(),
  zipCode: z.string().trim().length(5),
  city: z.string(),
  picture: z.optional(z.string()),
  isMediaCompliant: z.string().nullable(),
  hasPaid: z.string().nullable(),
  legalContactFirstName: z.optional(z.string()),
  legalContactLastName: z.optional(z.string()),
  legalContactPhoneNumber: z.optional(z.string()),
  legalContactId: z.optional(z.string()),
});

export type ClimbingState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    birthDate?: string[];
    email?: string[];
    phoneNumber?: string[];
    street?: string[];
    zipCode?: string[];
    city?: string[];
    picture?: string[];
    isMediaCompliant?: string[];
    hasPaid?: string[];
    legalContactFirstName?: string[];
    legalContactLastName?: string[];
    legalContactPhoneNumber?: string[];
  };
  message?: string | null;
};

const CreateClimbingMember = ClimbingMemberSchema.omit({
  id: true,
  legalContactId: true,
});
const UpdateClimbingMember = ClimbingMemberSchema.omit({
  id: true,
});

export async function createClimbingMember(
  _prevState: ClimbingState,
  formData: FormData,
) {
  const validatedFields = CreateClimbingMember.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    birthDate: formData.get('birthDate'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    street: formData.get('street'),
    zipCode: formData.get('zipCode'),
    city: formData.get('city'),
    isMediaCompliant: formData.get('isMediaCompliant'),
    hasPaid: formData.get('hasPaid'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Champs manquants. Impossible de créer un membre.',
    };
  }

  const {
    firstName,
    lastName,
    birthDate,
    email,
    phoneNumber,
    street,
    zipCode,
    city,
    picture,
    isMediaCompliant,
    hasPaid,
    legalContactFirstName,
    legalContactLastName,
    legalContactPhoneNumber,
  } = validatedFields.data;

  try {
    let legalContactId = undefined;

    if (
      legalContactFirstName &&
      legalContactLastName &&
      legalContactPhoneNumber
    ) {
      legalContactId = randomUUID();
      await sql`
        INSERT INTO legal_contacts (id, last_name, first_name, phone_number)
        VALUES (${legalContactId}, ${legalContactLastName}, ${legalContactFirstName}, ${legalContactPhoneNumber})
      `;
    }

    await sql`
      INSERT INTO members (
        id,
        last_name,
        first_name,
        birth_date,
        email,
        phone_number,
        street,
        zip_code,
        city,
        picture,
        is_media_compliant,
        has_paid,
        legal_contact_id
      )
      VALUES (
        ${randomUUID()},
        ${firstName},
        ${lastName},
        ${birthDate},
        ${email},
        ${phoneNumber},
        ${street},
        ${zipCode},
        ${city},
        ${picture},
        ${isMediaCompliant},
        ${hasPaid},
        ${legalContactId}
      )
    `;
  } catch (error) {
    console.log(error);
    return {
      message: 'Database Error: Failed to create a member.',
    };
  }

  revalidatePath('/dashboard/climbing');
  redirect('/dashboard/climbing');
}

export async function updateClimbingMember(
  id: string,
  _prevState: ClimbingState,
  formData: FormData,
) {
  const validationStatus = UpdateClimbingMember.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    birthDate: formData.get('birthDate'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    street: formData.get('street'),
    zipCode: formData.get('zipCode'),
    city: formData.get('city'),
    isMediaCompliant: formData.get('isMediaCompliant'),
    hasPaid: formData.get('hasPaid'),
  });

  if (!validationStatus.success) {
    return {
      errors: validationStatus.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const {
    firstName,
    lastName,
    birthDate,
    email,
    phoneNumber,
    street,
    zipCode,
    city,
    picture,
    isMediaCompliant,
    hasPaid,
    legalContactFirstName,
    legalContactLastName,
    legalContactPhoneNumber,
    legalContactId,
  } = validationStatus.data;

  try {
    const updateMember = await sql`
      UPDATE members
      SET last_name = ${lastName},
        first_name = ${firstName},
        birth_date = ${birthDate},
        email =   ${email},
        phone_number = ${phoneNumber},
        street= ${street},
        zip_code= ${zipCode},
        city= ${city},
        picture= ${picture},
        is_media_compliant= ${!!isMediaCompliant},
        has_paid= ${!!hasPaid},
        legal_contact_id= ${legalContactId}
      WHERE id = ${id}
    `;
    const updateLegalContact = await sql`
      UPDATE legal_contacts
      SET last_name = ${legalContactLastName},
        first_name = ${legalContactFirstName},
        phone_number = ${legalContactPhoneNumber}
      WHERE id = ${legalContactId}
    `;

    await Promise.all([updateMember, updateLegalContact]);
  } catch (error) {
    return { message: 'Database Error: Failed to Update a member.' };
  }

  revalidatePath('/dashboard/climbing');
  redirect('/dashboard/climbing');
}

export async function deleteMember(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
