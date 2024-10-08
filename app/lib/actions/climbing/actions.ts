'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import {
  getCloudinaryPicture,
  deleteCloudinaryImage,
  deleteCloudinaryImages,
} from '../../cloudinary/cloudinary';

// Configuration de l'image pour gestion des erreurs avec zod
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Schéma BBD pour un membre
const ClimbingMemberSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, `Veuillez indiquer le prénom.`),
  lastName: z.string().min(1, `Veuillez indiquer le nom.`),
  birthDate: z.string().min(1, `Veuillez indiquer la date de naissance.`),
  email: z.string().min(1, `Veuillez indiquer un email de contact.`),
  phoneNumber: z
    .string()
    .min(1, 'Veuillez indiquer un numéro de téléphone.')
    .length(10, 'Le numéro de téléphone doit être composé de 10 chiffres.')
    .regex(
      /^\d+$/,
      'Le numéro de téléphone ne doit contenir que des chiffres.',
    ),
  street: z.string().min(1, `Une adresse est requise.`),
  zipCode: z
    .string()
    .trim()
    .length(5, 'Le code postal doit contenir 5 chiffres.'),
  city: z.string().min(1, `La ville est requise`),
  picture: z
    .string()
    .url('Veuillez fournir une URL valide.')
    .or(
      z
        .instanceof(File)
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
          'Seuls les fichiers de types .jpg, .jpeg, .png et .webp sont acceptés.',
        )
        .refine(
          (file) => file.size <= MAX_FILE_SIZE,
          `La taille maximum de l'image est 5MB.`,
        ),
    ),
  isMediaCompliant: z.boolean().nullable(),
  hasPaid: z.boolean().nullable(),
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
  legalContactPhoneNumber: z.optional(
    z
      .string()
      .min(1, 'Veuillez indiquer un numéro de téléphone.')
      .length(10, 'Le numéro de téléphone doit être composé de 10 chiffres.')
      .regex(
        /^\d+$/,
        'Le numéro de téléphone ne doit contenir que des chiffres.',
      ),
  ),
  legalContactId: z.optional(z.string()),
});

export type ClimbingState = {
  isSuccess?: boolean;
  errors?: {
    firstName?: string[];
    lastName?: string[];
    birthDate?: string[];
    email?: string[];
    phoneNumber?: string[];
    street?: string[];
    zipCode?: string[];
    city?: string[];
    picture?: any[];
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

// Création d'un nouveau membre (admin and client side)
export async function createClimbingMember(
  _prevState: ClimbingState,
  formData: FormData,
  isRegistration: boolean,
) {
  const validatedFields = CreateClimbingMember.safeParse({
    lastName: formData.get('lastName'),
    firstName: formData.get('firstName'),
    birthDate: formData.get('birthDate'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    street: formData.get('street'),
    zipCode: formData.get('zipCode'),
    city: formData.get('city'),
    picture: formData.get('picture'),
    isMediaCompliant: formData.get('isMediaCompliant') === 'true',
    hasPaid: isRegistration ? false : formData.get('hasPaid') === 'true',
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;

    return {
      errors: fieldErrors,
      message: `Veuillez compléter les champs manquants avant de finaliser l'inscription.`,
      isSuccess: false,
    };
  }

  try {
    const imageUrl = await getCloudinaryPicture(
      formData.get('picture') as File,
    );

    const {
      lastName,
      firstName,
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

    let legalContactId;
    if (
      legalContactLastName &&
      legalContactFirstName &&
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
        ${lastName},
        ${firstName},
        ${birthDate},
        ${email},
        ${phoneNumber},
        ${street},
        ${zipCode},
        ${city},
        ${imageUrl},
        ${isMediaCompliant},
        ${isRegistration ? false : hasPaid},
        ${legalContactId}
      )
      
    `;

    return {
      isSuccess: true,
      message: 'Membre créé avec succès.',
    };
  } catch (error) {
    console.error('Database Error: Failed to create a member.', error);
    return {
      error,
      message: 'Erreur lors de la création du membre.',
      isSuccess: false,
    };
  }
}

// Fonction de mise à jour d'um membre (admin side)
export async function updateClimbingMember(
  id: string,
  _prevState: ClimbingState,
  formData: FormData,
) {
  const validationStatus = UpdateClimbingMember.safeParse({
    lastName: formData.get('lastName'),
    firstName: formData.get('firstName'),
    birthDate: formData.get('birthDate'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    street: formData.get('street'),
    zipCode: formData.get('zipCode'),
    city: formData.get('city'),
    picture: formData.get('picture'),
    isMediaCompliant: formData.get('isMediaCompliant') === 'true',
    hasPaid: formData.get('hasPaid') === 'true',
  });

  if (!validationStatus.success) {
    return {
      errors: validationStatus.error.flatten().fieldErrors,
      message: `Informations manquantes pour finaliser la mise à jour de l'adhérent.e.`,
    };
  }

  // Vérifier si une nouvelle image a été téléchargée
  let imageUrl: string | undefined;
  const pictureInput = validationStatus.data.picture || null;

  if (pictureInput instanceof File) {
    imageUrl = await getCloudinaryPicture(pictureInput);
  } else if (typeof pictureInput === 'string') {
    imageUrl = pictureInput;
  } else {
    imageUrl = undefined; // Pas d'image à mettre à jour
  }

  const {
    lastName,
    firstName,
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
        picture = ${imageUrl},
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
    console.error('Database Error: Failed to update the member.', error);
    return {
      message: 'Erreur lors de la mise à jour du membre.',
    };
  }
  revalidatePath('/dashboard/climbing');
  redirect('/dashboard/climbing');
}

// Fonction pour supprimer un membre de la base de données
export async function deleteMember(
  id: string,
  imageUrl: string,
): Promise<{ message: string }> {
  try {
    await sql`DELETE FROM members WHERE id = ${id}`;
    const imageId = imageUrl.split('/').pop()?.split('.')[0];
    if (imageId) {
      await deleteCloudinaryImage(imageId);
    } else {
      console.warn(`Failed to extract public ID from imageUrl: ${imageUrl}`);
    }
    return { message: 'Membre supprimé.' };
  } catch (error) {
    throw new Error('Erreur lors de la suppression du membre.');
  } finally {
    revalidatePath('/dashboard/climbing');
  }
}

// Fonction pour supprimer plusieurs membres de la base de données
export async function deleteMembers(
  ids: string[],
): Promise<{ message: string }> {
  try {
    if (ids.length === 0) {
      return { message: 'Aucun membre à supprimer.' };
    }
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');

    const imageQuery = `SELECT picture FROM members WHERE id IN (${placeholders})`;
    const imageResults = await sql.query(imageQuery, ids);

    const imageUrls = imageResults.rows
      .map((row) => row.picture)
      .filter(Boolean); //URLs valides

    const deleteQuery = `DELETE FROM members WHERE id IN (${placeholders})`;
    await sql.query(deleteQuery, ids);

    if (imageUrls.length > 0) {
      await deleteCloudinaryImages(imageUrls);
    }

    return { message: 'Membres supprimés.' };
  } catch (error) {
    console.error('Erreur lors de la suppression', error);
    throw new Error('Erreur lors de la suppression des membres.');
  } finally {
    revalidatePath('/dashboard/climbing');
  }
}
