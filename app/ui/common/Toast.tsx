import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
}

export const Toast = ({ message }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 p-4 rounded-md shadow-lg bg-green-500 text-white">
      {message}
    </div>
  );
};
