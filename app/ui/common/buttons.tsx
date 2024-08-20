import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';

// Bouton général (avec texte)
type ButtonColors = 'orange' | 'blue';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: ButtonColors;
}

export function Button({
  children,
  color = 'blue',
  className,
  ...rest
}: ButtonProps) {
  const colorClasses = {
    orange: 'bg-orange-medium hover:bg-orange-light active:bg-gray',
    blue: 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600',
  };
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center rounded-lg px-6 py-3 text-sm font-bold text-white  transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50 shadow-custom-shadow',
        colorClasses[color],
        className,
      )}
    >
      {children}
    </button>
  );
}

// Les autres types de boutons (hors DeleBtn)
export function CreateBtn({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">{text}</span>
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateBtn({ href }: { href: string }) {
  return (
    <Link href={href} className="rounded-md border p-2 hover:bg-gray-100">
      <PencilIcon className="w-5" />
    </Link>
  );
}
