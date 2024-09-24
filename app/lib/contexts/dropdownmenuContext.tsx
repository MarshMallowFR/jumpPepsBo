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
import { deleteMembers } from '../actions/climbing/actions';
import { Member } from '@/app/lib/types/climbing';

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

  const handleDeleteMany = async (selectedIds: string[]) => {
    const idsWithImages = selectedIds.map((id) => {
      const member = members.find((member) => member.id === id);
      return {
        id,
        imageUrl: member ? member.picture : '',
      };
    });

    await deleteMembers(idsWithImages);
  };

  const handleSelect = async (value: string) => {
    const action = actions.find((action) => action.value === value)?.action;
    if (action) {
      if (typeof action === 'function') {
        action(selectedIds);
      }

      switch (action) {
        case 'export-excel':
          downloadExcel(selectedIds);
          break;
        case 'delete-many':
          handleDeleteMany(selectedIds);
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
