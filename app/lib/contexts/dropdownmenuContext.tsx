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
import { downloadExcel } from '@/app/lib/excel/excel';

interface DropdownContextProps {
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  setSelectedImagesUrl: Dispatch<SetStateAction<string[]>>;
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
    action?: string | ((args: { ids: string[]; imagesUrl: string[] }) => void);
  }[];
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedImagesUrl, setSelectedImagesUrl] = useState<string[]>([]);

  const handleSelect = async (value: string) => {
    const action = actions.find((action) => action.value === value)?.action;
    if (action) {
      const actionArgs = { ids: selectedIds, imagesUrl: selectedImagesUrl };
      if (typeof action === 'function') {
        action(actionArgs);
      }

      switch (action) {
        case 'export-pdf':
          downloadExcel(selectedIds);
          break;
        default:
          break;
      }
    }
  };

  const value = useMemo(
    () => ({
      setIsVisible,
      setSelectedIds,
      setSelectedImagesUrl,
    }),
    [isVisible, setIsVisible, selectedIds, setSelectedImagesUrl],
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
