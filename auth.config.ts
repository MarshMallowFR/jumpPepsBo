import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isValidatingAdminAccount = nextUrl.pathname.includes('/validate');
      if (isValidatingAdminAccount && !isLoggedIn) return true;

      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
