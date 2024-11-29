'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import {
  getCloudinaryPicture,
  deleteCloudinaryImage,
  deleteCloudinaryImages,
} from '../../cloudinary/cloudinary';
import { getSectionIdByName } from '../../data';
import { getSeasons } from '../season/actions';

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
    .union([
      // Cas où le champ peut être une URL valide ou vide (facultatif et nullable)
      z.string().url('Veuillez fournir une URL valide.').optional().nullable(),

      // Cas où un fichier est fourni, avec la validation sur type et taille
      z
        .instanceof(File)
        .refine(
          (file) => file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type),
          'Seuls les fichiers de types .jpg, .jpeg, .png et .webp sont acceptés.',
        )
        .refine(
          (file) => file.size === 0 || file.size <= MAX_FILE_SIZE,
          "La taille maximum de l'image est 5MB.",
        )
        .optional()
        .nullable(),
    ])
    .refine(
      (val) =>
        val === null ||
        val === undefined ||
        val === '' ||
        val instanceof File ||
        typeof val === 'string',
      {
        message: 'Veuillez fournir une URL valide ou une image.',
      },
    )
    .optional()
    .nullable(),
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
});
const UpdateClimbingMember = ClimbingMemberSchema.omit({
  id: true,
});

async function isMemberAlreadyExists(
  firstName: string,
  lastName: string,
  birthDate: string,
) {
  const query = `
    SELECT id FROM members 
    WHERE unaccent(LOWER(first_name)) = unaccent(LOWER($1)) 
      AND unaccent(LOWER(last_name)) = unaccent(LOWER($2)) 
      AND birth_date = $3
  `; //comparaison insensible à la casse: unaccent pour les accents et LOWER pour tout convertir en minucusle
  const result = await sql.query(query, [firstName, lastName, birthDate]);
  return result.rows.length > 0 ? result.rows[0].id : null;
}

export async function createClimbingMember(
  _prevState: ClimbingState,
  formData: FormData,
  isRegistration: boolean,
) {
  const sectionRow = await getSectionIdByName('climbing');
  const sectionId = sectionRow;
  console.log('go');
  // Récupérer la saison actuelle pour la création des membres.
  const { currentSeason } = await getSeasons();
  if (!currentSeason) {
    return {
      isSuccess: false,
      message: 'Les inscriptions ne sont pas ouvertes actuellement.',
    };
  }
  const seasonId = currentSeason.id;
  console.log('currentseason:', currentSeason);
  if (!sectionId || !seasonId) {
    throw new Error('Section or season ID not found.');
  }

  const validatedFields = CreateClimbingMember.safeParse({
    picture: formData.get('picture') as File | null,
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
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      errors: fieldErrors,
      message: `Veuillez compléter les champs manquants avant de finaliser l'inscription.`,
      isSuccess: false,
    };
  }
  const client = await sql.connect();
  console.log('connect');
  try {
    await client.query('BEGIN');
    const picture = validatedFields.data.picture;
    const imageUrl =
      picture && picture instanceof File && picture.size > 0
        ? await getCloudinaryPicture(picture)
        : null;

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

    // Pas de doublon de membre
    const existingMemberId = await isMemberAlreadyExists(
      firstName,
      lastName,
      birthDate,
    );

    if (existingMemberId) {
      return await updateClimbingMember(
        existingMemberId,
        _prevState,
        formData,
        isRegistration,
      );
    }

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
      message: isRegistration
        ? `Formulaire d'inscription envoyé`
        : 'Membre créé avec succès.',
    };
  } catch (error) {
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
  isRegistration: boolean,
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

  const pictureInput = validationStatus.data.picture || null;

  const imageUrl =
    pictureInput instanceof File && pictureInput.size > 0
      ? await getCloudinaryPicture(pictureInput)
      : typeof pictureInput === 'string'
        ? pictureInput
        : '';

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
          birth_date = $4,
          gender = $5,
          nationality = $6,
          birth_town = $7,
          birth_departement = $8,
          email = $9,
          street = $10,
          additional_address_information = $11,
          zip_code = $12,
          city = $13,
          country = $14,
          phone_number = $15,
          phone_number2 = $16
      WHERE id = $17
    `;

    await client.query(updateMemberQuery, [
      imageUrl,
      lastName,
      firstName,
      birthDate,
      gender,
      nationality,
      birthTown,
      birthDepartement,
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

    // Mise à jour des contacts
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

    // Mise à jour du second contact si nécessaire
    const contact2Query = `
      SELECT second_contact_id FROM member_contact
      WHERE member_id = $1
    `;

    const contact2Result = await client.query(contact2Query, [id]);

    if (contact2Result!.rowCount) {
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

    // Mise à jour des informations de la section et saison
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
    return {
      isSuccess: true,
      message: isRegistration
        ? 'Formulaire envoyé'
        : 'Membre mis à jour avec succès.',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    return {
      message: isRegistration
        ? "Erreur lors de l'envoi du formulaire."
        : 'Erreur lors de la mise à jour du membre.',
    };
  } finally {
    client.release();
  }
}

export async function deleteMemberCompletely(id: string, imageUrl: string) {
  const client = await sql.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete the member's entries from the member_section_season table
    await client.query(
      `
      DELETE FROM member_section_season 
      WHERE member_id = $1
    `,
      [id],
    );
    // 2. Get the contact IDs from the member_contact table
    const contactsResult = await client.query(
      `
      SELECT first_contact_id, second_contact_id 
      FROM member_contact 
      WHERE member_id = $1
    `,
      [id],
    );
    const firstContactId = contactsResult.rows[0]?.first_contact_id;
    const secondContactId = contactsResult.rows[0]?.second_contact_id;

    // 3. Delete the member's entry from the member_contact table
    await client.query(
      `
      DELETE FROM member_contact 
      WHERE member_id = $1
    `,
      [id],
    );
    // 4. Delete the contacts from the contacts table (if they exist)
    if (firstContactId) {
      await client.query(
        `
        DELETE FROM contacts 
        WHERE id = $1
      `,
        [firstContactId],
      );
    }

    if (secondContactId) {
      await client.query(
        `
        DELETE FROM contacts 
        WHERE id = $1
      `,
        [secondContactId],
      );
    }
    // 5. Delete the member from the members table
    await client.query(
      `
      DELETE FROM members 
      WHERE id = $1
    `,
      [id],
    );

    await client.query('COMMIT');
    // Handle the image deletion
    if (imageUrl) {
      const imageId = imageUrl.split('/').pop()?.split('.')[0];
      if (imageId) {
        await deleteCloudinaryImage(imageId);
      } else {
        console.warn(`Failed to extract public ID from imageUrl: ${imageUrl}`);
      }
    }

    return { message: 'Membre supprimé.' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('Erreur lors de la suppression du membre.');
  } finally {
    client.release();
  }
}

export async function deleteMembersCompletely(ids: string[]) {
  const client = await sql.connect();
  try {
    if (ids.length === 0) {
      return { message: 'Aucun membre à supprimer.' };
    }

    await client.query('BEGIN');
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');

    // Step 1: Retrieve contact IDs associated with members
    const contactsQuery = `
      SELECT mc.first_contact_id, mc.second_contact_id 
      FROM member_contact mc 
      WHERE mc.member_id IN (${placeholders})
    `;
    const contactsResult = await client.query(contactsQuery, ids);
    const firstContactIds = contactsResult.rows
      .map((row) => row.first_contact_id)
      .filter(Boolean);
    const secondContactIds = contactsResult.rows
      .map((row) => row.second_contact_id)
      .filter(Boolean);

    // Step 2: Delete from member_contact where member_id matches the given ids
    const deleteMemberContactQuery = `
      DELETE FROM member_contact 
      WHERE member_id IN (${placeholders})
    `;
    await client.query(deleteMemberContactQuery, ids);

    // Step 3: Delete images associated with members if they exist
    const imageQuery = `SELECT picture FROM members WHERE id IN (${placeholders})`;
    const imageResults = await client.query(imageQuery, ids);
    const imageUrls = imageResults.rows
      .map((row) => row.picture)
      .filter(Boolean); // Filter valid image URLs

    // Step 4: Delete contacts in the contacts table for first_contact_ids and second_contact_ids
    if (firstContactIds.length > 0) {
      const firstContactPlaceholders = firstContactIds
        .map((_, index) => `$${index + 1}`)
        .join(', ');
      await client.query(
        `DELETE FROM contacts WHERE id IN (${firstContactPlaceholders})`,
        firstContactIds,
      );
    }

    if (secondContactIds.length > 0) {
      const secondContactPlaceholders = secondContactIds
        .map((_, index) => `$${index + 1}`)
        .join(', ');
      await client.query(
        `DELETE FROM contacts WHERE id IN (${secondContactPlaceholders})`,
        secondContactIds,
      );
    }

    // Step 5: Delete from member_section_season for the specified members
    const deleteMemberSeasonQuery = `
      DELETE FROM member_section_season 
      WHERE member_id IN (${placeholders})
    `;
    await client.query(deleteMemberSeasonQuery, ids);

    // Step 6: Finally, delete from members table
    const deleteQuery = `DELETE FROM members WHERE id IN (${placeholders})`;
    await client.query(deleteQuery, ids);

    // Step 7: Delete images from cloud storage if they exist
    if (imageUrls.length > 0) {
      await deleteCloudinaryImages(imageUrls);
    }

    await client.query('COMMIT');
    return { message: 'Membres supprimés.' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('Erreur lors de la suppression des membres.');
  } finally {
    client.release();
  }
}

export async function removeMemberFromSeason(
  memberId: string,
  seasonId: string,
) {
  const client = await sql.connect();

  try {
    await client.query('BEGIN');

    const checkMemberAndImageQuery = `
      SELECT COUNT(*) FILTER (WHERE season_id != $2) AS season_count, m.picture AS image_url 
      FROM member_section_season mss 
      LEFT JOIN members m ON mss.member_id = m.id
      WHERE mss.member_id = $1
      GROUP BY m.picture
    `;
    const { rows } = await client.query(checkMemberAndImageQuery, [
      memberId,
      seasonId,
    ]);
    const { season_count: seasonCount, image_url: imageUrl } = rows[0] || {};
    if (parseInt(seasonCount, 10) === 0) {
      await deleteMemberCompletely(memberId, imageUrl || '');
    } else {
      const deleteMemberSeasonQuery = `
        DELETE FROM member_section_season 
        WHERE member_id = $1 AND season_id = $2
      `;
      await client.query(deleteMemberSeasonQuery, [memberId, seasonId]);
    }
    await client.query('COMMIT');
    return { message: 'Désinscription du membre effectuée.' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('Erreur lors de la suppression du membre de la saison.');
  } finally {
    client.release();
    revalidatePath(`/dashboard/climbing?seasonId=${seasonId}`);
  }
}

export async function removeMembersFromSeason(
  memberIds: string[],
  seasonId: string,
) {
  const client = await sql.connect();
  try {
    await client.query('BEGIN');
    for (const memberId of memberIds) {
      // check for each member the action to accomplish
      const checkMemberQuery = `
        SELECT COUNT(*) AS season_count 
        FROM member_section_season 
        WHERE member_id = $1 AND season_id != $2
      `;
      const { rows } = await client.query(checkMemberQuery, [
        memberId,
        seasonId,
      ]);
      const seasonCount = parseInt(rows[0].season_count, 10);

      if (seasonCount === 0) {
        const imageQuery = `SELECT picture FROM members WHERE id = $1`;
        const imageResult = await client.query(imageQuery, [memberId]);
        const imageUrl = imageResult.rows[0]?.picture || '';
        await deleteMemberCompletely(memberId, imageUrl);
      }
      const deleteMemberSeasonQuery = `
        DELETE FROM member_section_season 
        WHERE member_id = $1 AND season_id = $2
      `;
      await client.query(deleteMemberSeasonQuery, [memberId, seasonId]);
    }

    await client.query('COMMIT');

    return { message: 'Membres retirés de la saison.' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('Erreur lors de la suppression des membres de la saison.');
  } finally {
    client.release();
    revalidatePath(`/dashboard/climbing?seasonId=${seasonId}`);
  }
}
