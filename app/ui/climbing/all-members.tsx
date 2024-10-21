import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import { Member } from '@/app/lib/types/climbing';
import AllMembersTable from './all-members-table';

export default function AllMembers({ allMembers }: { allMembers: Member[] }) {
  return <AllMembersTable members={allMembers} />;
}
