'use client';
import ToastContextProvider from '@/app/lib/contexts/toastContext';
import { Member } from '@/app/lib/types/climbing';
import { UpdateBtn } from '../common/buttons';
import DeleteMember from './delete-member';
import Status from './status';
import Image from 'next/image';
import { useState } from 'react';
import { Checkbox } from '../common/checkbox';

export default function Table({ members }: { members: Member[] }) {
  const [selectedStates, setSelectedStates] = useState(
    members.reduce(
      (acc, member) => {
        acc[member.id] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const allSelected = Object.values(selectedStates).every(
    (isSelected) => isSelected,
  );

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
    setSelectedStates((prevState) => {
      const newStates = {
        ...prevState,
        [id]: !prevState[id],
      };
      if (!newStates[id] && allSelected) {
        return newStates;
      } else if (Object.values(newStates).every((isSelected) => isSelected)) {
        return newStates;
      }
      return newStates;
    });
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
            Nom et prénom
          </th>
          <th scope="col" className="px-3 py-5 font-medium">
            Email
          </th>
          <th scope="col" className="px-3 py-5 font-medium">
            Statut du paiement
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
                <Image
                  src={member.picture}
                  className="rounded-full max-h-7"
                  width={28}
                  height={28}
                  alt={`${member.firstName} ${member.lastName}'s profile picture`}
                />
                <p>
                  {member.firstName} {member.lastName}
                </p>
              </div>
            </td>
            <td className="whitespace-nowrap px-3 py-3">{member.email}</td>
            <td className="whitespace-nowrap px-3 py-3">
              <Status isValid={member.hasPaid} />
            </td>
            <td className="whitespace-nowrap py-3 pl-6 pr-3">
              <div className="flex justify-end gap-3">
                <UpdateBtn href={`/dashboard/climbing/${member.id}/edit`} />
                <ToastContextProvider>
                  <DeleteMember id={member.id} imageUrl={member.picture} />
                </ToastContextProvider>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
