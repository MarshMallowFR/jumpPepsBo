import '@/app/ui/style/global.css';
import { lusitana } from '@/app/ui/style/fonts';
import dynamic from 'next/dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${lusitana.className} antialiased px-6 py-6`}>
        {children}
      </body>
    </html>
  );
}
