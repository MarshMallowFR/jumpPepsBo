import '@/app/ui/style/global.css';
import { kanit } from '@/app/ui/style/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${kanit.className} antialiased px-6 py-6`}>
        {children}
      </body>
    </html>
  );
}
