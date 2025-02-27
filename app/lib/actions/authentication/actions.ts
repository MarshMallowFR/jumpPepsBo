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
    return 'AuthSuccess';
  } catch (error) {
    return `AuthError`;
  }
}
