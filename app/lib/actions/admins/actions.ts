'use server';

import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import handlerEmail from './sendMail';
import { generateActivationToken, hashActivationToken } from './createToken';
import { authenticate } from '../authentication/actions';

type CompleteAdmin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  validity: string;
};

export type AdminState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
  };
  message?: string | null;
};
export type ValidateAdminState = {
  errors?: {
    password?: string[];
    checkPassword?: string[];
  };
  message?: string | null;
};

const AdminSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

const CreateUpdateAdmin = AdminSchema.omit({
  id: true,
});

const ValidAdminSchema = z
  .object({
    password: z.string().min(8),
    checkPassword: z.string().min(8),
  })
  .refine(
    ({ password, checkPassword }) => {
      return password === checkPassword;
    },
    {
      message: 'Passwords must match!',
      path: ['confirmPassword'],
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
    await handlerEmail(email, token);
  } catch (error) {
    console.log(error);

    return {
      message: 'Erreur base de données. Impossible de créer un admin.',
    };
  }

  revalidatePath('/dashboard/admins');
  redirect('/dashboard/admins');
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
  } catch (error) {
    console.log(error);
    return { message: "Erreur base de données. Impossible d'éditer un admin." };
  }

  revalidatePath('/dashboard/admins');
  redirect('/dashboard/admins');
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
    return { message: 'Invalid Token or Email' };
  }

  try {
    const validatedFields = ValidAdminSchema.safeParse({
      password: formData.get('password'),
      checkPassword: formData.get('checkPassword'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Champs manquants. Impossible d'éditer un admin.",
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

    revalidatePath('/dashboard/admins');
    redirect('/dashboard/admins');
  } catch (error) {
    console.log(error);
    return { message: `Erreur: Impossible de valider l'Admin.` };
  }
}
