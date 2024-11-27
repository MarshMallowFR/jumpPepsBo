import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import type { Admin } from '@/app/lib/types/admins';
import bcrypt from 'bcrypt';

async function getAdmin(email: string): Promise<Admin | undefined> {
  try {
    const admin = await sql<Admin>`SELECT * from admins where email=${email}`;
    return admin.rows[0];
  } catch (error) {
    throw new Error('Failed to fetch user.');
  }
}
//Ou export default NextAuth({ ...authConfig, providers: [...] }) ??
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const admin = await getAdmin(email);

          if (!admin) {
            throw new Error('Admin non trouvé');
          }

          if (!admin.password) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, admin.password);

          if (passwordsMatch) {
            return admin;
          } else {
            throw new Error('Mot de passe non valide.');
          }
        }
        throw new Error('CredentialSignin');
      },
    }),
  ],
});
