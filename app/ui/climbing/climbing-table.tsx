import ToastContextProvider from '@/app/lib/contexts/toastContext';
import SeasonContextProvider from '@/app/lib/contexts/seasonContext';
import { getSeasons } from '@/app/lib/actions/season/actions';
import { MemberList, SeasonMemberList } from '@/app/lib/types/climbing';
import ClimbingMembers from './climbing-members';

export default async function ClimbingTable({
  allMembers,
}: {
  allMembers: MemberList[] | SeasonMemberList[];
}) {
  const allseasons = await getSeasons();

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 md:pt-0">
          <ToastContextProvider>
            <SeasonContextProvider seasons={allseasons.seasons}>
              <ClimbingMembers members={allMembers} />
            </SeasonContextProvider>
          </ToastContextProvider>
        </div>
      </div>
    </div>
  );
}
