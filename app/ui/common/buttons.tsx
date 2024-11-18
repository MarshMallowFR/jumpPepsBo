import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';
import { Color } from '@/app/lib/types/color';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: Color;
}

export function Button({
  children,
  color = Color.BLUE,
  className,
  ...rest
}: ButtonProps) {
  const colorClasses = {
    [Color.ORANGE]: 'bg-orange-medium hover:bg-orange-light',
    [Color.BLUE]: 'bg-blue-medium hover:bg-blue-light',
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

// Les autres types de boutons
export function CreateBtn({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex h-10 items-center rounded-lg bg-blue-medium px-4 text-sm font-medium text-white transition-colors hover:bg-blue-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium"
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

interface DeleteOrRemoveBtnProps {
  id: string;
  handleDeleteOrRemove: () => Promise<void>;
}

export function DeleteBtn({
  id,
  handleDeleteOrRemove,
}: DeleteOrRemoveBtnProps) {
  return (
    <button
      id={id}
      onClick={handleDeleteOrRemove}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <TrashIcon className="w-5" />
    </button>
  );
}

export function DeleteManyBtn({
  children,
  color = Color.BLUE,
  className,
  ...rest
}: ButtonProps) {
  const colorClasses = {
    [Color.ORANGE]: 'bg-orange-medium hover:bg-orange-light',
    [Color.BLUE]: 'bg-blue-medium hover:bg-blue-light',
  };
  return (
    <button
      {...rest}
      className={clsx(
        'flex items-center rounded-md px-6 py-2 text-sm font-medium text-white  transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        colorClasses[color],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function RemoveBtn({
  id,
  handleDeleteOrRemove,
}: DeleteOrRemoveBtnProps) {
  return (
    <button
      id={id}
      onClick={handleDeleteOrRemove}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <XCircleIcon className="w-5" />
    </button>
  );
}
