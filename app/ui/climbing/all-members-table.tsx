'use client';
import { MemberList } from '@/app/lib/types/climbing';
import DeleteMember from './delete-member';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Checkbox } from '../common/checkbox';

interface TableProps {
  members: MemberList[];
}

export default function AllMembersTable({ members }: TableProps) {
  //   const { setIsVisible: setIsVisibleDropdown, setSelectedIds } =
  //     useDropdownContext();
  const [selectedStates, setSelectedStates] = useState(
    members.reduce(
      (acc, member) => {
        acc[member.id] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const allSelected = useMemo(() => {
    return Object.values(selectedStates).every((isSelected) => isSelected);
  }, [selectedStates]);

  const handleSelectAll = () => {
    const newSelectedState = !allSelected;
    setSelectedStates((prevState) =>
      Object.keys(prevState).reduce(
        (acc, id) => {
          acc[id] = newSelectedState;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    );
  };

  const handleSelectMember = (id: string) => {
    setSelectedStates((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const getSelectedMemberIds = () => {
    return Object.keys(selectedStates).filter((id) => selectedStates[id]);
  };

  return (
    <table className="hidden min-w-full text-gray-900 md:table">
      <thead className="rounded-lg text-left text-sm font-normal">
        <tr>
          <th>
            <Checkbox
              defaultValue={allSelected}
              handleChange={handleSelectAll}
              idFor={'all-selected'}
            />
          </th>
          <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
            Nom et Prénom
          </th>
          <th scope="col" className="px-3 py-5 font-medium">
            Email
          </th>
          <th scope="col" className="relative py-3 pl-6 pr-3">
            <span className="sr-only">Edit</span>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {members?.map((member) => (
          <tr
            key={member.id}
            className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
          >
            <td>
              <Checkbox
                defaultValue={selectedStates[member.id]}
                handleChange={() => handleSelectMember(member.id)}
                idFor={member.id}
              />
            </td>
            <td className="whitespace-nowrap py-3 pl-6 pr-3">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={member.picture}
                    fill
                    style={{ objectFit: 'cover' }}
                    alt={`${member.firstName} ${member.lastName}'s profile picture`}
                  />
                </div>
                <p>
                  {member.lastName} {member.firstName}
                </p>
              </div>
            </td>
            <td className="whitespace-nowrap px-3 py-3">{member.email}</td>
            <td className="whitespace-nowrap py-3 pl-6 pr-3">
              <DeleteMember id={member.id} imageUrl={member.picture} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
