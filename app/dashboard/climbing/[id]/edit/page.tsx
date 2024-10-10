import Form from '@/app/ui/climbing/edit-form';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import { fetchMemberById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { MemberWithSeason } from '@/app/lib/types/climbing';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const member: MemberWithSeason | undefined = await fetchMemberById(id);
  //const member = await fetchMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Membres', href: '/dashboard/climbing' },
          {
            label: 'Editer un membre',
            href: `/dashboard/climbing/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form member={member} />
    </main>
  );
}
