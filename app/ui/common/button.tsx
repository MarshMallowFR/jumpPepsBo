import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        '  flex h-10 items-center rounded-lg px-6 py-3 text-sm font-bold text-white  transition-colors  bg-orange-medium hover:bg-orange-light  active:bg-gray aria-disabled:cursor-not-allowed aria-disabled:opacity-50 shadow-custom-shadow',
        className,
      )}
    >
      {children}
    </button>
  );
}
