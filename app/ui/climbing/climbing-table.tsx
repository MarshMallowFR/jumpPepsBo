import ToastContextProvider from '@/app/lib/contexts/toastContext';
import SeasonContextProvider from '@/app/lib/contexts/seasonContext';
import MembersManager from './member-management';
import { getSeasons } from '@/app/lib/actions/season/actions';
import { MemberList, SeasonMemberList } from '@/app/lib/types/climbing';
import NotFoundMessage from '../common/notFoundMessage';

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
              {allMembers && allMembers.length > 0 ? (
                <MembersManager allMembers={allMembers} />
              ) : (
                <NotFoundMessage message="Aucun membre trouvé" />
              )}
            </SeasonContextProvider>
          </ToastContextProvider>
        </div>
      </div>
    </div>
  );
}
