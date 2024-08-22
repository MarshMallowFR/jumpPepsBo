import '@/app/ui/style/global.css';
import { lusitana } from '@/app/ui/style/fonts';
import dynamic from 'next/dynamic';
//import { ToastContextProvider } from './lib/contexts/ToastContext';

// dynamic avec ssr: false permet de charger un composant côté client uniquement.
const ToastContextProvider = dynamic(
  () => import('./lib/contexts/ToastContext'),
  { ssr: false },
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${lusitana.className} antialiased px-6 py-6`}>
        <ToastContextProvider>{children}</ToastContextProvider>
      </body>
    </html>
  );
}
