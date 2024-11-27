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
import { useToastContext, ToastType } from './toastContext';
import {
  deleteMembersCompletely,
  removeMembersFromSeason,
} from '../actions/climbing/actions';
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
  children,
}: {
  actions: {
    label: string;
    value: string;
    action?: string | ((ids: string[]) => void);
  }[];
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { selectedSeason } = useSeasonContext();
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

  const handlePromise = async (promise: Promise<{ message: string } | Error>) =>
    promise
      .then(({ message }) => handleToast(true, ToastType.SUCCESS, message))
      .catch((error) =>
        handleToast(
          true,
          ToastType.ERROR,
          error instanceof Error ? error.message : 'Une erreur est survenue.',
        ),
      );

  const handleSelect = async (value: string) => {
    const action = actions.find((action) => action.value === value)?.action;
    if (action) {
      if (typeof action === 'function') {
        action(selectedIds);
      }

      switch (action) {
        case 'export-excel':
          await handlePromise(downloadExcel(selectedIds));
          break;
        case 'delete-many':
          await handlePromise(deleteMembersCompletely(selectedIds));
          setTimeout(() => {
            window.location.href = `/dashboard/climbing`;
          }, 600);
          break;

        case 'remove-many':
          if (selectedSeason) {
            await handlePromise(
              removeMembersFromSeason(selectedIds, selectedSeason),
            );
          } else {
            handleToast(true, ToastType.ERROR, 'Aucune saison sélectionnée.');
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
        <Dropdown label="Options" options={actions} onSelect={handleSelect} />
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
