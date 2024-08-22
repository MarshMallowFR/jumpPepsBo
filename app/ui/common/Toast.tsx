import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
}

export const Toast = ({ message }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  const isSuccess = !message.toLowerCase().includes('erreur');

  return (
    <div
      className={`fixed top-16 right-6 p-4 rounded-md shadow-lg text-white transform transition-transform duration-500 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      } ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}
    >
      {message}
    </div>
  );
};
