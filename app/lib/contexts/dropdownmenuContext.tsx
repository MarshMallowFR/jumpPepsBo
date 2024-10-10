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
import { MemberWithSeason } from '@/app/lib/types/climbing';
import { useToastContext, ToastType } from './toastContext';
import { deleteMembers } from '../actions/climbing/actions';
import { useSeasonContext } from './seasonContext';

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
  members: MemberWithSeason[];
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const {
    setIsVisible: setToastVisible,
    setToastType,
    setToastMessage,
  } = useToastContext();

  const handleToast = (
    isVisible: boolean,
    type: ToastType,
    message: string,
  ) => {
    setToastVisible(isVisible);
    setToastType(type);
    setToastMessage(message);
  };

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
            handleToast(true, ToastType.SUCCESS, result.message);
          } catch (error) {
            console.error("Erreur lors de l'exportation:", error);
            handleToast(
              true,
              ToastType.ERROR,
              error instanceof Error
                ? error.message
                : 'Une erreur est survenue.',
            );
          }
          break;
        case 'delete-many':
          try {
            const result = await deleteMembers(selectedIds);
            handleToast(true, ToastType.SUCCESS, result.message);
          } catch (error) {
            handleToast(
              true,
              ToastType.ERROR,
              error instanceof Error
                ? error.message
                : 'Une erreur est survenue.',
            );
          }
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
