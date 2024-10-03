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
import { getSeasonIdByName, getSectionIdByName } from '../../getdata';

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
  country: z.string().refine((val) => !val || val.length === 2, {
    message: `Veuillez indiquer le code pays (2 caractères).`,
  }),
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
    .refine((val) => !val || (val.length === 10 && /^\d+$/.test(val)), {
      message: 'Le numéro de téléphone doit être composé de 10 chiffres.',
    }),
  birthTown: z.optional(
    z.string().min(1, `La commune de naissance est requise`),
  ),
  birthDepartement: z.optional(
    z.string().min(1, `Le département de naissance est requis`),
  ),
  // licenseType: z.optional(z.enum(['J', 'A', 'F'])),
  // insurance: z.optional(z.enum(['RC', 'B', 'B+', 'B++'])),
  // supplementalInsurance: z.optional(z.enum(['IJ1', 'IJ2', 'IJ3', 'NON'])),
  license: z.string().optional().nullable(),
  licenseType: z.string().optional().nullable(),
  insurance: z.string().optional().nullable(),
  supplementalInsurance: z.string().optional().nullable(),
  assaultProtectionOption: z.boolean().optional().nullable(),
  skiOption: z.boolean().optional().nullable(),
  slacklineOption: z.boolean().optional().nullable(),
  trailRunningOption: z.boolean().optional().nullable(),
  mountainBikingOption: z.boolean().optional().nullable(),
  isMediaCompliant: z.boolean(), //.nullable()
  hasPaid: z.boolean(), //.nullable()
  legalContactId: z.optional(z.string()),
  legalContactLastName: z
    .string()
    .min(1, `Veuillez indiquer le nom du.de la représentant.e légal.e.`)
    .nullable()
    .optional(),
  legalContactFirstName: z
    .string()
    .min(1, `Veuillez indiquer le prénom du.de la représentant.e légal.e.`)
    .nullable()
    .optional(),
  legalContactPhoneNumber: z
    .string()
    .refine((val) => val.length === 10 && /^\d+$/.test(val), {
      message: 'Le numéro de téléphone doit être composé de 10 chiffres.',
    })
    .nullable()
    .optional(),
  legalContactEmail: z
    .string()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Veuillez entrer une adresse email valide.',
    })
    .nullable()
    .optional(),
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
    legalContactFirstName?: string[];
    legalContactLastName?: string[];
    legalContactPhoneNumber?: string[];
    legalContactEmail?: string[];
    contactLink?: string[];
    contactLastName?: string[];
    contactFirstName?: string[];
    contactPhoneNumber?: string[];
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
  const sectionResult = await getSectionIdByName('climbing');
  const sectionId = sectionResult?.rows?.[0]?.id;

  const seasonResult = await getSeasonIdByName('2024-2025');
  const seasonId = seasonResult?.rows?.[0]?.id;

  if (!sectionId || !seasonId) {
    throw new Error('Section or season ID not found.');
  }

  // const hasPaid = isRegistration ? false : formData.get('hasPaid') === 'true';
  // const isMediaCompliant = formData.get('isMediaCompliant') === 'true';
  // const license = formData.get('license') as string | null;
  // const licenseType = formData.get('licenseType') as string | null;
  // const insurance = (formData.get('insurance') as string) || 'RC';
  // const supplementalInsurance =
  //   (formData.get('supplementalInsurance') as string) || 'NON';
  // const assaultProtectionOption =
  //   formData.get('assaultProtectionOption') === 'true' ? true : false;
  // const skiOption = formData.get('skiOption') === 'true' ? true : false;
  // const slacklineOption =
  //   formData.get('slacklineOption') === 'true' ? true : false;
  // const trailRunningOption =
  //   formData.get('trailRunningOption') === 'true' ? true : false;
  // const mountainBikingOption =
  //   formData.get('mountainBikingOption') === 'true' ? true : false;

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
    legalContactLastName: formData.get('legalContactLastName'),
    legalContactFirstName: formData.get('legalContactFirstName'),
    legalContactPhoneNumber: formData.get('legalContactPhoneNumber'),
    legalContactEmail: formData.get('legalContactEmail'),
    license: formData.get('license') as string | null,
    licenseType: formData.get('licenseType') as string | null,
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

  try {
    await sql`BEGIN`;

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
      legalContactLastName,
      legalContactFirstName,
      legalContactPhoneNumber,
      legalContactEmail,
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

    let legalContactId;
    if (
      legalContactLastName &&
      legalContactFirstName &&
      legalContactPhoneNumber &&
      legalContactEmail
    ) {
      legalContactId = randomUUID();

      await sql`
        INSERT INTO legal_contacts (id, last_name, first_name, phone_number, email)
        VALUES (${legalContactId}, ${legalContactLastName}, ${legalContactFirstName}, ${legalContactPhoneNumber}, ${legalContactEmail})
      `;
    }
    const memberId = randomUUID();
    await sql`
      INSERT INTO members (
        id,
        picture,
        last_name,
        first_name,
        birth_date,
        gender,
        nationality,
        street,
        additional_address_information,
        zip_code,
        city,
        country,
        email,
        phone_number,
        phone_number2,
        birth_town,
        birth_departement,
        contact_link,
        contact_last_name,
        contact_first_name,
        contact_phone_number,
        legal_contact_id
      )
      VALUES (
        ${memberId},
        ${imageUrl},
        ${lastName},
        ${firstName},
        ${birthDate},
        ${gender},
        ${nationality},
        ${street},
        ${additionalAddressInformation},
        ${zipCode},
        ${city},
        ${country},
        ${email},
        ${phoneNumber},
        ${phoneNumber2},
        ${birthTown},
        ${birthDepartement},
        ${contactLink},
        ${contactLastName},
        ${contactFirstName},
        ${contactPhoneNumber},
        ${legalContactId}
      )
    `;

    await sql`
      INSERT INTO member_section_season (
        section_id,
        member_id,
        season_id,
        license,
        license_type,
        insurance,
        supplemental_insurance,
        assault_protection_option,
        ski_option,
        slackline_option,
        trail_running_option,
        mountain_biking_option,
        is_media_compliant,
        has_paid
      )
      VALUES (
        ${sectionId},
        ${memberId},
        ${seasonId},
        ${license ?? null},
        ${licenseType ?? null},
        ${insurance},
        ${supplementalInsurance},
       ${assaultProtectionOption},
    ${skiOption},
    ${slacklineOption},
    ${trailRunningOption},
    ${mountainBikingOption},
    ${isMediaCompliant},
        ${hasPaid}
      )
    `;

    await sql`COMMIT`;
    return {
      isSuccess: true,
      message: `Membre créé avec succès.`,
    };
  } catch (error) {
    await sql`ROLLBACK`;
    console.error('Database Error: Failed to create a member.', error);
    return {
      error,
      isSuccess: false,
      message: 'Erreur lors de la création du membre.',
    };
  }
}

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
