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
import { Member } from '@/app/lib/types/climbing';
import { useToastContext, ToastType } from './toastContext';
import { handleDeleteMembers } from '../actions/dropdown/dropdownActions';

interface DropdownContextProps {
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
}

const DropdownContext = createContext<DropdownContextProps | undefined>(
  undefined,
);

const DropdownContextProvider = ({
  actions,
  members,
  children,
}: {
  actions: {
    label: string;
    value: string;
    action?: string | ((ids: string[]) => void);
  }[];
  members: Member[];
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const {
    setIsVisible: setToastVisible,
    setToastType,
    setToastMessage,
  } = useToastContext();

  const handleSelect = async (value: string) => {
    const action = actions.find((action) => action.value === value)?.action;
    if (action) {
      if (typeof action === 'function') {
        action(selectedIds);
      }

      switch (action) {
        case 'export-excel':
          try {
            const result = await downloadExcel(selectedIds);
            setToastVisible(true);
            setToastType(ToastType.SUCCESS);
            setToastMessage(result.message);
          } catch (error) {
            console.error("Erreur lors de l'exportation:", error);
            setToastVisible(true);
            setToastType(ToastType.ERROR);
            setToastMessage(
              error instanceof Error
                ? error.message
                : 'Une erreur est survenue.',
            );
          }
          break;
        case 'delete-many':
          await handleDeleteMembers(selectedIds, members, {
            setIsVisible,
            setToastVisible,
            setToastType,
            setToastMessage,
          });
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
