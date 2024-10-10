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
import { getSeasonIdByName, getSectionIdByName } from '../../data';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ClimbingMemberSchema = z.object({
  id: z.string(),
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
  lastName: z.string().min(1, `Veuillez indiquer le nom.`),
  birthName: z.optional(z.string().optional().nullable()),
  firstName: z.string().min(1, `Veuillez indiquer le prénom.`),
  birthDate: z.string().min(1, `Veuillez indiquer la date de naissance.`),
  gender: z.enum(['F', 'M']),
  nationality: z.optional(
    z.string().min(1, `Veuillez indiquer la nationalité.`),
  ),
  street: z.string().min(1, `Une adresse est requise.`),
  additionalAddressInformation: z.string().optional(),
  zipCode: z
    .string()
    .trim()
    .length(5, 'Le code postal doit contenir 5 chiffres.'),
  city: z.string().min(1, `La ville est requise`),
  country: z
    .string()
    .trim()
    .length(2, 'Le code pays doit contenir 2 caractères.')
    .optional(),
  email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Veuillez entrer une adresse email valide.',
  }),
  phoneNumber: z
    .string()
    .refine((val) => val.length === 10 && /^\d+$/.test(val), {
      message: 'Le numéro de téléphone doit être composé de 10 chiffres.',
    }),
  phoneNumber2: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || val.trim() === '' || (val.length === 10 && /^\d+$/.test(val)),
      {
        message: 'Le numéro de téléphone doit être composé de 10 chiffres.',
      },
    ),
  birthTown: z.optional(
    z.string().min(1, `La commune de naissance est requise`),
  ),
  birthDepartement: z.optional(
    z.string().min(1, `Le département de naissance est requis`),
  ),
  license: z.string().optional().nullable(),
  licenseType: z.string().optional().nullable(),
  insurance: z.string().optional().nullable(),
  supplementalInsurance: z.string().optional().nullable(),
  assaultProtectionOption: z.boolean().optional().nullable(),
  skiOption: z.boolean().optional().nullable(),
  slacklineOption: z.boolean().optional().nullable(),
  trailRunningOption: z.boolean().optional().nullable(),
  mountainBikingOption: z.boolean().optional().nullable(),
  isMediaCompliant: z.boolean(),
  hasPaid: z.boolean(),

  contactLink: z
    .string()
    .min(1, `Veuillez indiquer le lien de parenté avec l'adhérent.e.`),
  contactLastName: z
    .string()
    .min(1, `Veuillez indiquer le nom de la personne à contacter.`),
  contactFirstName: z
    .string()
    .min(1, `Veuillez indiquer le prénom de la personne à contacter.`),
  contactPhoneNumber: z
    .string()
    .refine((val) => val.length === 10 && /^\d+$/.test(val), {
      message:
        'Le numéro de téléphone du contact doit être composé de 10 chiffres.',
    }),
  contactEmail: z
    .string()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Veuillez entrer une adresse email valide.',
    })
    .nullable()
    .optional(),
  contact2Id: z.optional(z.string()),
  contact2Link: z
    .string()
    .min(1, `Veuillez indiquer le lien de parenté avec l'adhérent.e.`)
    .nullable()
    .optional(),
  contact2LastName: z
    .string()
    .min(1, `Veuillez indiquer le nom du.de la représentant.e légal.e.`)
    .nullable()
    .optional(),
  contact2FirstName: z
    .string()
    .min(1, `Veuillez indiquer le prénom du.de la représentant.e légal.e.`)
    .nullable()
    .optional(),
  contact2PhoneNumber: z
    .string()
    .refine((val) => val.length === 10 && /^\d+$/.test(val), {
      message: 'Le numéro de téléphone doit être composé de 10 chiffres.',
    })
    .nullable()
    .optional(),
  contact2Email: z
    .string()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Veuillez entrer une adresse email valide.',
    })
    .nullable()
    .optional(),
});

export type ClimbingState = {
  isSuccess?: boolean;
  errors?: {
    picture?: string[];
    lastName?: string[];
    firstName?: string[];
    birthDate?: string[];
    gender?: string[];
    nationality?: string[];
    street?: string[];
    additionalAddressInformation?: string[];
    zipCode?: string[];
    city?: string[];
    country?: string[];
    email?: string[];
    phoneNumber?: string[];
    phoneNumber2?: string[];
    birthTown?: string[];
    birthDepartement?: string[];
    licenseType?: string[];
    insurance?: string[];
    supplementalInsurance?: string[];
    assaultProtectionOption?: string[];
    skiOption?: string[];
    slacklineOption?: string[];
    trailRunningOption?: string[];
    mountainBikingOption?: string[];
    isMediaCompliant?: string[];
    hasPaid?: string[];
    contactLink?: string[];
    contactLastName?: string[];
    contactFirstName?: string[];
    contactPhoneNumber?: string[];
    contactEmail?: string[];
    contact2Link?: string[];
    contact2FirstName?: string[];
    contact2LastName?: string[];
    contact2PhoneNumber?: string[];
    contact2Email?: string[];
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
  const sectionRow = await getSectionIdByName('climbing');
  const sectionId = sectionRow;

  const seasonRow = await getSeasonIdByName('2024-2025');
  const seasonId = seasonRow;

  if (!sectionId || !seasonId) {
    throw new Error('Section or season ID not found.');
  }

  const validatedFields = CreateClimbingMember.safeParse({
    picture: formData.get('picture'),
    lastName: formData.get('lastName'),
    firstName: formData.get('firstName'),
    birthDate: formData.get('birthDate'),
    gender: formData.get('gender'),
    nationality: formData.get('nationality'),
    street: formData.get('street'),
    additionalAddressInformation: formData.get('additionalAddressInformation'),
    zipCode: formData.get('zipCode'),
    city: formData.get('city'),
    country: formData.get('country') || 'FR',
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    phoneNumber2: formData.get('phoneNumber2'),
    birthTown: formData.get('birthTown'),
    birthDepartement: formData.get('birthDepartement'),
    contactLink: formData.get('contactLink'),
    contactLastName: formData.get('contactLastName'),
    contactFirstName: formData.get('contactFirstName'),
    contactPhoneNumber: formData.get('contactPhoneNumber'),
    contactEmail: formData.get('contactEmail'),
    contact2Link: formData.get('contact2Link'),
    contact2LastName: formData.get('contact2LastName'),
    contact2FirstName: formData.get('contact2FirstName'),
    contact2PhoneNumber: formData.get('contact2PhoneNumber'),
    contact2Email: formData.get('contact2Email'),
    license: formData.get('license') as string | null,
    licenseType: formData.get('licenseType'),
    insurance: (formData.get('insurance') as string) || 'RC',
    supplementalInsurance:
      (formData.get('supplementalInsurance') as string) || 'NON',
    assaultProtectionOption: formData.get('assaultProtectionOption') === 'true',
    skiOption: formData.get('skiOption') === 'true',
    slacklineOption: formData.get('slacklineOption') === 'true',
    trailRunningOption: formData.get('trailRunningOption') === 'true',
    mountainBikingOption: formData.get('mountainBikingOption') === 'true',
    hasPaid: isRegistration ? false : formData.get('hasPaid') === 'true',
    isMediaCompliant: formData.get('isMediaCompliant') === 'true',
  });

  if (!validatedFields.success) {
    console.error('Validation error:', validatedFields.error);
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      errors: fieldErrors,
      message: `Veuillez compléter les champs manquants avant de finaliser l'inscription.`,
      isSuccess: false,
    };
  }
  const client = await sql.connect();
  try {
    await client.query('BEGIN');

    const imageUrl = await getCloudinaryPicture(
      formData.get('picture') as File,
    );

    const {
      lastName,
      firstName,
      birthDate,
      gender,
      nationality,
      street,
      additionalAddressInformation,
      zipCode,
      city,
      country,
      email,
      phoneNumber,
      phoneNumber2,
      birthTown,
      birthDepartement,
      contactLink,
      contactLastName,
      contactFirstName,
      contactPhoneNumber,
      contactEmail,
      contact2Link,
      contact2LastName,
      contact2FirstName,
      contact2PhoneNumber,
      contact2Email,
      license,
      licenseType,
      insurance,
      supplementalInsurance,
      assaultProtectionOption,
      skiOption,
      slacklineOption,
      trailRunningOption,
      mountainBikingOption,
      hasPaid,
      isMediaCompliant,
    } = validatedFields.data;

    const memberId = randomUUID();
    const contactId = randomUUID();
    await client.query(
      `INSERT INTO members (
        id, picture, last_name, first_name, birth_date, gender, nationality, street,
        additional_address_information, zip_code, city, country, email, phone_number,
        phone_number2, birth_town, birth_departement
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17)`,
      [
        memberId,
        imageUrl,
        lastName,
        firstName,
        birthDate,
        gender,
        nationality,
        street,
        additionalAddressInformation,
        zipCode,
        city,
        country,
        email,
        phoneNumber,
        phoneNumber2,
        birthTown,
        birthDepartement,
      ],
    );

    await client.query(
      `INSERT INTO contacts (id, link, last_name, first_name, phone_number, email)
         VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        contactId,
        contactLink,
        contactLastName,
        contactFirstName,
        contactPhoneNumber,
        contactEmail,
      ],
    );

    let contact2Id;

    if (
      contact2Link &&
      contact2LastName &&
      contact2FirstName &&
      contact2PhoneNumber &&
      contact2Email
    ) {
      contact2Id = randomUUID();
      console.log('Contact 2 Data:', {
        contact2Link,
        contact2LastName,
        contact2FirstName,
        contact2PhoneNumber,
        contact2Email,
      });
      await client.query(
        `INSERT INTO contacts (id, link, last_name, first_name, phone_number, email)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          contact2Id,
          contact2Link,
          contact2LastName,
          contact2FirstName,
          contact2PhoneNumber,
          contact2Email,
        ],
      );
    }

    await client.query(
      `INSERT INTO member_contact (member_id, first_contact_id, second_contact_id)
    VALUES ($1, $2, $3)`,
      [memberId, contactId, contact2Id ?? null],
    );

    await client.query(
      `INSERT INTO member_section_season (
        section_id, member_id, season_id, license, license_type, insurance,
        supplemental_insurance, assault_protection_option, ski_option,
        slackline_option, trail_running_option, mountain_biking_option,
        is_media_compliant, has_paid
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )`,
      [
        sectionId,
        memberId,
        seasonId,
        license ?? null,
        licenseType,
        insurance,
        supplementalInsurance,
        assaultProtectionOption,
        skiOption,
        slacklineOption,
        trailRunningOption,
        mountainBikingOption,
        isMediaCompliant,
        hasPaid,
      ],
    );
    await client.query('COMMIT');
    return {
      isSuccess: true,
      message: `Membre créé avec succès.`,
    };
  } catch (error) {
    console.error('Erreur détectée :', error);
    await client.query('ROLLBACK');
    return {
      error,
      isSuccess: false,
      message: 'Erreur lors de la création du membre.',
    };
  } finally {
    client.release();
  }
}

export async function updateClimbingMember(
  id: string,
  _prevState: ClimbingState,
  formData: FormData,
) {
  const validationStatus = UpdateClimbingMember.safeParse({
    picture: formData.get('picture'),
    lastName: formData.get('lastName'),
    firstName: formData.get('firstName'),
    birthDate: formData.get('birthDate'),
    gender: formData.get('gender'),
    nationality: formData.get('nationality'),
    street: formData.get('street'),
    additionalAddressInformation: formData.get('additionalAddressInformation'),
    zipCode: formData.get('zipCode'),
    city: formData.get('city'),
    country: formData.get('country'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    phoneNumber2: formData.get('phoneNumber2'),
    birthTown: formData.get('birthTown'),
    birthDepartement: formData.get('birthDepartement'),
    contactLink: formData.get('contactLink'),
    contactLastName: formData.get('contactLastName'),
    contactFirstName: formData.get('contactFirstName'),
    contactPhoneNumber: formData.get('contactPhoneNumber'),
    contactEmail: formData.get('contactEmail'),
    contact2Link: formData.get('legalContactLink'),
    contact2LastName: formData.get('legalContactLastName'),
    contact2FirstName: formData.get('legalContactFirstName'),
    contact2PhoneNumber: formData.get('legalContactPhoneNumber'),
    contact2Email: formData.get('legalContactEmail'),
    license: formData.get('license') as string | null,
    licenseType: formData.get('licenseType'),
    insurance: formData.get('insurance'),
    supplementalInsurance: formData.get('supplementalInsurance'),
    assaultProtectionOption: formData.get('assaultProtectionOption') === 'true',
    skiOption: formData.get('skiOption') === 'true',
    slacklineOption: formData.get('slacklineOption') === 'true',
    trailRunningOption: formData.get('trailRunningOption') === 'true',
    mountainBikingOption: formData.get('mountainBikingOption') === 'true',
    hasPaid: formData.get('hasPaid') === 'true',
    isMediaCompliant: formData.get('isMediaCompliant') === 'true',
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
    gender,
    nationality,
    street,
    additionalAddressInformation,
    zipCode,
    city,
    country,
    email,
    phoneNumber,
    phoneNumber2,
    birthTown,
    birthDepartement,
    contactLink,
    contactLastName,
    contactFirstName,
    contactPhoneNumber,
    contactEmail,
    contact2Link,
    contact2LastName,
    contact2FirstName,
    contact2PhoneNumber,
    contact2Email,
    license,
    licenseType,
    insurance,
    supplementalInsurance,
    assaultProtectionOption,
    skiOption,
    slacklineOption,
    trailRunningOption,
    mountainBikingOption,
    hasPaid,
    isMediaCompliant,
  } = validationStatus.data;

  const client = await sql.connect();
  try {
    await client.query('BEGIN');

    const updateMemberQuery = `
      UPDATE members
      SET picture = $1,
          last_name = $2,
          first_name = $3,
          email = $4,
          street = $5,
          additional_address_information = $6,
          zip_code = $7,
          city = $8,
          country = $9,
          phone_number = $10,
          phone_number2 = $11
      WHERE id = $12
    `;

    await client.query(updateMemberQuery, [
      imageUrl,
      lastName,
      firstName,
      email,
      street,
      additionalAddressInformation,
      zipCode,
      city,
      country,
      phoneNumber,
      phoneNumber2,
      id,
    ]);

    const updateContactQuery = `
      UPDATE contacts
      SET link = $1,
          last_name = $2,
          first_name = $3,
          phone_number = $4,
          email = $5
      WHERE id = (
          SELECT first_contact_id
          FROM member_contact
          WHERE member_id = $6
      )
    `;

    await client.query(updateContactQuery, [
      contactLink,
      contactLastName,
      contactFirstName,
      contactPhoneNumber,
      contactEmail,
      id,
    ]);

    const contact2Query = `
      SELECT second_contact_id FROM member_contact
      WHERE member_id = $1
    `;

    const contact2Result = await client.query(contact2Query, [id]);

    if (contact2Result.rowCount > 0) {
      const contact2Id = contact2Result.rows[0].contact2_id;

      if (contact2Id) {
        await client.query(
          `UPDATE contacts
           SET link = $1,
               last_name = $2,
               first_name = $3,
               phone_number = $4,
               email = $5
           WHERE id = $6`,
          [
            contact2Link,
            contact2LastName,
            contact2FirstName,
            contact2PhoneNumber,
            contact2Email,
            contact2Id,
          ],
        );
      }
    }

    const updateSectionSeasonQuery = `
      UPDATE member_section_season
      SET license = $1,
          license_type = $2,
          insurance = $3,
          supplemental_insurance = $4,
          assault_protection_option = $5,
          ski_option = $6,
          slackline_option = $7,
          trail_running_option = $8,
          mountain_biking_option = $9,
          is_media_compliant= $10,
          has_paid= $11
      WHERE member_id = $12
    `;

    await client.query(updateSectionSeasonQuery, [
      license ? license : null,
      licenseType,
      insurance,
      supplementalInsurance,
      assaultProtectionOption,
      skiOption,
      slacklineOption,
      trailRunningOption,
      mountainBikingOption,
      isMediaCompliant,
      hasPaid,
      id,
    ]);

    await client.query('COMMIT');
  } catch (error) {
    console.error('Database Error: Failed to update the member.', error);
    await client.query('ROLLBACK');
    return {
      message: 'Erreur lors de la mise à jour du membre.',
    };
  } finally {
    client.release();
  }
  revalidatePath('/dashboard/climbing');
  redirect('/dashboard/climbing');
}

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
