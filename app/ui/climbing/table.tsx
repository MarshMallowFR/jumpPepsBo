'use client';
import { MemberList, SeasonMemberList } from '@/app/lib/types/climbing';
import { UpdateBtn } from '../common/buttons';
import Status from './status';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Checkbox } from '../common/checkbox';
import { useDropdownContext } from '@/app/lib/contexts/dropdownmenuContext';
import RemoveMemberFromSeason from './remove-member-season';
import { useSeasonContext } from '@/app/lib/contexts/seasonContext';
import NotFoundMessage from '../common/notFoundMessage';
import DeleteMember from './delete-member';
import UserIcon from '../common/userIcon';

interface TableProps {
  members: SeasonMemberList[] | MemberList[];
}

export default function Table({ members }: TableProps) {
  const { setIsVisible: setIsVisibleDropdown, setSelectedIds } =
    useDropdownContext();
  const { selectedSeason } = useSeasonContext();

  const isSeasonMembers = (
    members: SeasonMemberList[] | MemberList[],
  ): members is SeasonMemberList[] => 'hasPaid' in (members[0] || {});
  const seasonMembersMode = isSeasonMembers(members);

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

  useEffect(() => {
    const selectedMemberIds = getSelectedMemberIds();
    setSelectedIds(selectedMemberIds);
    if (selectedMemberIds.length > 0) {
      setIsVisibleDropdown(true);
    } else {
      setIsVisibleDropdown(false);
    }
  }, [selectedStates]);

  if (!members) {
    return <div>Loading</div>;
  }

  if (members?.length < 1) {
    return <NotFoundMessage message="Aucun membre trouvé" />;
  }

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
          {seasonMembersMode && (
            <th scope="col" className="px-3 py-5 font-medium">
              Statut du paiement
            </th>
          )}
          <th scope="col" className="py-5 px-3 font-medium text-right">
            Actions
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
                  {member.picture ? (
                    <Image
                      src={member.picture}
                      fill
                      style={{ objectFit: 'cover' }}
                      alt={`${member.firstName} ${member.lastName}'s profile picture`}
                    />
                  ) : (
                    <UserIcon />
                  )}
                </div>
                <p>
                  {member.lastName} {member.firstName}
                </p>
              </div>
            </td>
            <td className="whitespace-nowrap px-3 py-3">{member.email}</td>
            {seasonMembersMode && (
              <td className="whitespace-nowrap px-3 py-3">
                <Status isValid={(member as SeasonMemberList).hasPaid} />
              </td>
            )}
            <td className="whitespace-nowrap py-3 pl-6 pr-3">
              <div className="flex justify-end gap-3">
                {seasonMembersMode ? (
                  <>
                    <UpdateBtn
                      href={`/dashboard/climbing/${member.id}/edit?seasonId=${selectedSeason}`}
                    />
                    <RemoveMemberFromSeason
                      memberId={member.id}
                      seasonId={selectedSeason}
                    />
                  </>
                ) : (
                  <DeleteMember id={member.id} imageUrl={member.picture} />
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
