'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration de l'image
const MAX_FILE_SIZE = 500000;
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
  picture: z
    .array(z.custom<File>())
    .refine(
      (files) => {
        return files.every((file) => file instanceof File);
      },
      {
        message: 'Veuillez importer une photo.',
      },
    )
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      `La taille maximum de l'image est 5MB.`,
    )
    .refine(
      (files) =>
        files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      'Seuls les fichiers de types .jpg, .jpeg, .png et .webp sont acceptés.',
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
    picture?: any[];
    isMediaCompliant?: boolean[];
    hasPaid?: boolean[];
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
    picture: [formData.get('picture')],
    isMediaCompliant: formData.get('isMediaCompliant') === 'true', //Conversion en boolean
    hasPaid: isRegistration ? false : formData.get('hasPaid'), //=== 'false', // Conversion en boolean - 'true' ?
  });

  // console.log(
  //   'fichier actions.ts fonction createClimbingMember/validatedFierlds:',
  //   validatedFields,
  // );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    if (fieldErrors.picture) {
      return {
        errors: { picture: fieldErrors.picture },
        message: `Erreur lors de l'import de l'image.`,
      };
    }
    return {
      errors: fieldErrors,
      message: `Veuillez compléter les champs manquants avant de finaliser l'inscription.`,
    };
  }

  try {
    let imageUrl = '';
    const picture = formData.get('picture') as File;
    if (picture) {
      const arrayBuffer = await picture.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { tags: ['nextjs-server-actions-upload-sneakers'] },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(result);
            },
          )
          .end(buffer);
      });
      imageUrl = result.secure_url;
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

    let legalContactId;
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
        ${imageUrl},
        ${isMediaCompliant},
        ${isRegistration ? false : hasPaid},
        ${legalContactId}
      )
    `;

    if (!isRegistration) {
      revalidatePath('/dashboard/climbing');
      redirect('/dashboard/climbing');
    }
  } catch (error) {
    console.error('Database Error: Failed to create a member.', error);
    return { error };
  }
}

// Fonction de mise à jour d'um membre (admin)
// export async function updateClimbingMember(
//   id: string,
//   _prevState: ClimbingState,
//   formData: FormData,
// ) {
//   const validationStatus = UpdateClimbingMember.safeParse({
//     firstName: formData.get('firstName'),
//     lastName: formData.get('lastName'),
//     birthDate: formData.get('birthDate'),
//     email: formData.get('email'),
//     phoneNumber: formData.get('phoneNumber'),
//     street: formData.get('street'),
//     zipCode: formData.get('zipCode'),
//     city: formData.get('city'),
//     picture: [formData.get('picture')],
//     isMediaCompliant: formData.get('isMediaCompliant') === 'true', // Conversion en boolean
//     hasPaid: formData.get('hasPaid') === 'false', // Conversion en boolean
//   });

//   if (!validationStatus.success) {
//     return {
//       errors: validationStatus.error.flatten().fieldErrors,
//       message: `Informations manquantes pour finaliser la mise à jour de l'adhérent.e.`,
//     };
//   }

//     let imageUrl = '';
//     const picture = formData.get('picture') as File;
//     if (picture) {
//       const arrayBuffer = await picture.arrayBuffer();
//       const buffer = new Uint8Array(arrayBuffer);
//       const result = await new Promise<any>((resolve, reject) => {
//         cloudinary.uploader
//           .upload_stream(
//             { tags: ['nextjs-server-actions-upload-sneakers'] },
//             (error, result) => {
//               if (error) {
//                 reject(error);
//                 return;
//               }
//               resolve(result);
//             },
//           )
//           .end(buffer);
//       });
//       imageUrl = result.secure_url;
//     }

//   const {
//     firstName,
//     lastName,
//     birthDate,
//     email,
//     phoneNumber,
//     street,
//     zipCode,
//     city,
//     picture,
//     isMediaCompliant,
//     hasPaid,
//     legalContactFirstName,
//     legalContactLastName,
//     legalContactPhoneNumber,
//     legalContactId,
//   } = validationStatus.data;

//   try {
//     const updateMember = await sql`
//       UPDATE members
//       SET last_name = ${lastName},
//         first_name = ${firstName},
//         birth_date = ${birthDate},
//         email =   ${email},
//         phone_number = ${phoneNumber},
//         street= ${street},
//         zip_code= ${zipCode},
//         city= ${city},
//         picture= ${imageUrl},
//         is_media_compliant= ${!!isMediaCompliant},
//         has_paid= ${!!hasPaid},
//         legal_contact_id= ${legalContactId}
//       WHERE id = ${id}
//     `;
//     const updateLegalContact = await sql`
//       UPDATE legal_contacts
//       SET last_name = ${legalContactLastName},
//         first_name = ${legalContactFirstName},
//         phone_number = ${legalContactPhoneNumber}
//       WHERE id = ${legalContactId}
//     `;

//     await Promise.all([updateMember, updateLegalContact]);
//   } catch (error) {
//     return { message: 'Database Error: Failed to Update a member.' };
//   }

//   revalidatePath('/dashboard/climbing');
//   redirect('/dashboard/climbing');
// }

export async function deleteMember(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
