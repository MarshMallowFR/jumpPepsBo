'use server';

import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import handlerEmail from './sendMail';
import { generateActivationToken, hashActivationToken } from './createToken';
import { authenticate } from '../authentication/actions';
import { AdminState, ValidateAdminState } from '../../types/admins';

const AdminSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, `Veuillez indiquer le prénom.`),
  lastName: z.string().min(1, `Veuillez indiquer le nom.`),
  email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Veuillez entrer une adresse email valide.',
  }),
});

const CreateUpdateAdmin = AdminSchema.omit({
  id: true,
});

const ValidAdminSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    checkPassword: z
      .string()
      .min(8, 'Les deux mots de passe doivent être identiques.'),
  })
  .refine(
    ({ password, checkPassword }) => {
      return password === checkPassword;
    },
    {
      message: 'Les deux mots de passe doivent être identiques.',
      path: ['checkPassword'],
    },
  );

export async function createAdmin(_prevState: AdminState, formData: FormData) {
  const validatedFields = CreateUpdateAdmin.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      isSuccess: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Champs manquants. Impossible de créer un admin.',
    };
  }

  const { firstName, lastName, email } = validatedFields.data;
  const token = generateActivationToken();
  const hashedToken = hashActivationToken(token);
  const date = new Date();
  const validity = date.setDate(date.getDate() + 1);

  try {
    await sql`
      INSERT INTO admins (
        id,
        last_name,
        first_name,
        email,
        validated,
        token,
        validity
      )
      VALUES (
        ${randomUUID()},
        ${firstName},
        ${lastName},
        ${email},
        false,
        ${hashedToken},
        ${validity}
      )
    `;
    const emailResult = await handlerEmail(email, token);
    if (!emailResult.isSuccess) {
      return {
        isSuccess: false,
        message: `L'email de validation n'a pas pu être envoyé.`,
      };
    }
    return {
      isSuccess: true,
      message: 'Admin créé avec succès et email  envoyé.',
    };
  } catch (error) {
    return {
      isSuccess: false,
      message: 'Erreur base de données.',
    };
  }
}

export async function updateAdmin(
  id: string,
  _prevState: AdminState,
  formData: FormData,
) {
  const validatedFields = CreateUpdateAdmin.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Champs manquants. Impossible d'éditer un admin.",
    };
  }

  const { firstName, lastName, email } = validatedFields.data;

  try {
    await sql`
      UPDATE admins
      SET last_name = ${lastName},
        first_name = ${firstName},
        email =   ${email}
      WHERE id = ${id}
    `;
    return { isSuccess: true, message: 'Mise à jour effectuée.' };
  } catch (error) {
    return {
      isSuccess: false,
      message: 'Erreur base de données.',
    };
  }
}

export async function deleteAdmin(id: string): Promise<{ message: string }> {
  try {
    await sql`DELETE FROM admins WHERE id = ${id}`;
    return { message: 'Admin supprimé.' };
  } catch (error) {
    return { message: `Erreur lors de la suppression de l'admin.` };
  } finally {
    revalidatePath('/dashboard/admins');
  }
}

export async function validateAdmin(
  email: string | null,
  token: string | null,
  _prevState: ValidateAdminState,
  formData: FormData,
) {
  if (!token || !email) {
    return { message: 'Email ou Token non valide' };
  }

  try {
    const validatedFields = ValidAdminSchema.safeParse({
      password: formData.get('password'),
      checkPassword: formData.get('checkPassword'),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      return {
        errors: fieldErrors,
        message: 'Mot de passe non validé. Admin non enregistré',
        isSuccess: false,
      };
    }

    const { password } = validatedFields.data;
    const hashedToken = hashActivationToken(token);
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await sql`
      SELECT * FROM admins WHERE email = ${email} AND token = ${hashedToken}
    `;

    if (admin.rows.length === 0) {
      return { message: 'Invalid Token or Email' };
    }

    if (Date.now < admin.rows[0].validity) {
      throw new Error('Token Expired');
    }

    await sql`
      UPDATE admins
      SET validated = true, password = ${hashedPassword}, token = null
      WHERE id = ${admin.rows[0].id} AND token = ${hashedToken}
    `;

    const newFormData = new FormData();
    newFormData.append('email', email);
    newFormData.append('password', password);

    await authenticate('', newFormData);
    return {
      isSuccess: true,
      message: 'Mot de passe enregistré. Nouvel admin validé.',
    };
  } catch (error) {
    return {
      isSuccess: false,
      message: `Erreur: Impossible de valider l'admin.`,
    };
  }
}
