'use client';

import Dropdown from '@/app/ui/common/dropdown';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

interface DropdownContextProps {
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
}

const DropdownContext = createContext<DropdownContextProps | undefined>(
  undefined,
);

const DropdownContextProvider = ({
  actions,
  children,
}: {
  actions: {
    label: string;
    value: string;
    action?: (ids: string[]) => void;
  }[];
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (value: string) => {
    const action = actions.find((action) => action.value === value)?.action;
    if (action) {
      action(selectedIds);
    }
  };

  const value = useMemo(
    () => ({
      setIsVisible,
      setSelectedIds,
    }),
    [isVisible, setIsVisible, selectedIds],
  );

  return (
    <DropdownContext.Provider value={value}>
      {isVisible && (
        <Dropdown label="Actions" options={actions} onSelect={handleSelect} />
      )}
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
