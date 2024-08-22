import Image from 'next/image';
import { UpdateBtn } from '@/app/ui/common/buttons';
import Status from '@/app/ui/climbing/status';
import { fetchFilteredClimbingMembers } from '@/app/lib/data';
import DeleteMember from './delete-member';
import ToastContextProvider from '@/app/lib/contexts/toastContexttest';

export default async function ClimbingTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const members = await fetchFilteredClimbingMembers(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
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
                  <td className="whitespace-nowrap px-3 py-3">
                    {member.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <Status isValid={member.hasPaid} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateBtn
                        href={`/dashboard/climbing/${member.id}/edit`}
                      />
                      <ToastContextProvider>
                        <DeleteMember
                          id={member.id}
                          imageUrl={member.picture}
                        />
                      </ToastContextProvider>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
