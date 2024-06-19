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
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    return 'CredentialSignin';
  }
}
