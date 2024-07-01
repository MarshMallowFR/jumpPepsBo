'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

// Schéma BBD pour un membre
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
  isMediaCompliant: z.boolean().nullable(), // Utilisation de boolean
  hasPaid: z.boolean().nullable(), /// Utilisation de boolean
  legalContactFirstName: z.optional(z.string()),
  legalContactLastName: z.optional(z.string()),
  legalContactPhoneNumber: z.optional(z.string()),
  legalContactId: z.optional(z.string()),
});

// Gestion des erreurs
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
    isMediaCompliant?: boolean[]; // Utilisation de boolean
    hasPaid?: boolean[]; // Utilisation de boolean
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

// Fonction pour créer un membre
export async function createClimbingMember(
  _prevState: ClimbingState,
  formData: FormData,
  isRegistration: boolean,
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
    isMediaCompliant: formData.get('isMediaCompliant') === 'false', // Conversion en boolean
    hasPaid: isRegistration ? false : formData.get('hasPaid') === 'false', // Conversion en boolean - 'true' ?
  });

  //console.log('actions.ts createClimbingMember:', validatedFields);
  //résultat du console.log: object validatedFields avec champs success: true, et data: {avec les champs}

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Champs manquants. Impossible de créer un membre.', // message à modifier selon isRegistration?
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
        ${isRegistration ? false : hasPaid},
        ${legalContactId}
      )
    `;

    console.log(isRegistration);

    //console.log('Création du membre dans actions.ts:', firstName, lastName); // OK fonctionne
    // Test redirection conditionnelle
    if (!isRegistration) {
      // Redirection pour un admin
      revalidatePath('/dashboard/climbing');
      redirect('/dashboard/climbing');
    }
  } catch (error) {
    console.log('Database Error: Failed to create a member.', error);
    return {
      message: 'Database Error: Failed to create a member.',
    };
  }
}

// Fonction de mise à jour d'um membre (admin)
export async function updateClimbingMember(
  id: string,
  _prevState: ClimbingState,
  formData: FormData,
) {
  const validationStatus = UpdateClimbingMember.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    birthDate: formData.get('birthDate'), // mettre un number?
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    street: formData.get('street'),
    zipCode: formData.get('zipCode'),
    city: formData.get('city'),
    isMediaCompliant: formData.get('isMediaCompliant') === 'true', // Conversion en boolean à voir pour la valeur
    hasPaid: formData.get('hasPaid') === 'true', // Conversion en boolean à voir pour la valeur
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
