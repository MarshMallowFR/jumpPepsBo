'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { handleSectionTranslation } from '@/app/lib/utils';

export default function NavLinks({
  links,
}: {
  links: { id: string; name: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-blue-extralight hover:text-blue-medium md:flex-none md:justify-start md:p-2 md:px-3 text-transform: capitalize',
              {
                'bg-blue-extralight text-blue-medium': pathname === link.href,
              },
            )}
          >
            <p className="hidden md:block">
              {handleSectionTranslation(link.name)}
            </p>
          </Link>
        );
      })}
    </>
  );
}
