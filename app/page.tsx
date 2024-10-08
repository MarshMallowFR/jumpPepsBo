import Logo from '@/app/ui/assets/jump-peps-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

import Link from 'next/link';
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-medium p-4 md:h-52">
        <Logo />
      </div>

      <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
        <Link
          href="/login"
          className="flex items-center gap-5 self-start rounded-lg bg-blue-medium px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-light md:text-base"
        >
          <span>Log in</span>
          <ArrowRightIcon className="w-5 md:w-6" />
        </Link>
      </div>
      <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12"></div>
    </main>
  );
}
