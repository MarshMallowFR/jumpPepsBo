import clsx from 'clsx';

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
