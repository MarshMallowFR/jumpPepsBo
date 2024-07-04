'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
//import formidable from 'formidable';

// Schéma BBD pour un membre
const ClimbingMemberSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, `Veuillez indiquer le prénom.`),
  lastName: z.string().min(1, `Veuillez indiquer le nom.`),
  birthDate: z.string().min(1, `Veuillez indiquer la date de naissance.`),
  email: z.string().min(1, `Veuillez indiquer un email de contact.`),
  phoneNumber: z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return value;
      }

      return value.trim().replace(/\s+/g, '');
    },
    z
      .string()
      .length(10, `Le numéro de téléphone doit être composé de 10 chiffres.`),
  ),
  street: z.string().min(1, `Une adresse est requise.`),
  zipCode: z
    .string()
    .trim()
    .length(5, 'Le code postal doit contenir 5 chiffres.'),
  city: z.string().min(1, `La ville est requise`),
  picture: z.optional(z.string()),
  isMediaCompliant: z.boolean().nullable(), // Utilisation de boolean
  hasPaid: z.boolean().nullable(), // Utilisation de boolean
  legalContactFirstName: z.optional(
    z
      .string()
      .min(1, `Veuillez indiquer le prénom du.de la représentant.e légal.e.`),
  ),
  legalContactLastName: z.optional(
    z
      .string()
      .min(1, `Veuillez indiquer le nom du.de la représentant.e légal.e.`),
  ),
  legalContactPhoneNumber: z.optional(z.string()),
  legalContactId: z.optional(
    z.preprocess(
      (value) => {
        if (typeof value !== 'string') {
          return value;
        }

        return value.trim().replace(/\s+/g, '');
      },
      z
        .string()
        .length(10, `Le numéro de téléphone doit être composé de 10 chiffres.`),
    ),
  ),
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
    //picture: formData.get('picture'), // NE FONCTIONNE PAS
    isMediaCompliant: formData.get('isMediaCompliant') === 'true', //Conversion en boolean
    hasPaid: isRegistration ? false : formData.get('hasPaid') === 'false', // Conversion en boolean - 'true' ?
  });

  console.log(
    'fichier actions.ts fonction createClimbingMember:',
    validatedFields,
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `Veuillez compléter les champs manquants avant de finaliser l'inscription.`,
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
    isMediaCompliant,
    hasPaid,
    legalContactFirstName,
    legalContactLastName,
    legalContactPhoneNumber,
  } = validatedFields.data;

  // let pictureUrl = null;
  // if (files.picture) {
  //   try {
  //     const result = await cloudinary.uploader.upload(files.picture.path, {
  //       folder: 'members',
  //       public_id: randomUUID(),
  //     });
  //     pictureUrl = result.secure_url;
  //   } catch (uploadError) {
  //     return {
  //       message: 'Error uploading the picture to Cloudinary',
  //     };
  //   }
  // }

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
    birthDate: formData.get('birthDate'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    street: formData.get('street'),
    zipCode: formData.get('zipCode'),
    city: formData.get('city'),
    isMediaCompliant: formData.get('isMediaCompliant') === 'true', // Conversion en boolean
    hasPaid: formData.get('hasPaid') === 'false', // Conversion en boolean
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
