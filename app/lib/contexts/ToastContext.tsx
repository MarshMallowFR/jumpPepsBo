'use client';

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ToastProviderProps = {
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setToastType: Dispatch<SetStateAction<string>>;
  setToastMessage: Dispatch<SetStateAction<string>>;
};

export const ToastContext = createContext<ToastProviderProps | undefined>(
  undefined,
);

const ToastContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [toastType, setToastType] = useState('success');
  const [message, setToastMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const value = useMemo(() => {
    return {
      setIsVisible,
      setToastType,
      setToastMessage,
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <ToastContext.Provider value={value}>
      <div
        className={`fixed top-16 right-6 p-4 rounded-md shadow-lg text-white transform transition-transform duration-500 ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }
      ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
      >
        {message}
      </div>
      {children}
    </ToastContext.Provider>
  );
};

// création d'un hook personnaliser pour encapsuler l'accès au contexte => centraliser la logique de vérification et rendre le code des composants plus propre
export const useToastContext = () => {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error('');
  }

  return value;
};

export default ToastContextProvider;
