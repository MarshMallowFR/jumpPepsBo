import { Member } from '@/app/lib/types/climbing';

export default function AllMembersTable({
  allMembers,
}: {
  allMembers: Member[];
}) {
  return (
    <div>
      <h2>Membres sans saison sélectionnée</h2>
      <ul>
        {allMembers.map((member) => (
          <li key={member.id}>
            {member.firstName} {member.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
}
