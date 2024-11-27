'use server';

import { signIn } from '@/auth';

/**
 * LOGIN
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', {
      redirect: false,
      ...Object.fromEntries(formData),
    });
    return 'Authentification réussie';
  } catch (error) {
    return `Erreur d'authentification.`;
  }
}
