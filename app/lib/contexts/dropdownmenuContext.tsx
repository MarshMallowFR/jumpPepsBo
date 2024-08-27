'use client';

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

interface DropdownContextProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

const DropdownContext = createContext<DropdownContextProps | undefined>(
  undefined,
);

const DropdownContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const value = useMemo(
    () => ({ isVisible, setIsVisible }),
    [isVisible, setIsVisible],
  );

  return (
    <DropdownContext.Provider value={value}>
      {isVisible && <div>test</div>}
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdownContext = () => {
  const value = useContext(DropdownContext);
  if (!value) {
    throw new Error('');
  }

  return value;
};
export default DropdownContextProvider;
