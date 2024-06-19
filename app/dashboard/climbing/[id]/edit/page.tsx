import Form from '@/app/ui/climbing/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchClimbingMemberById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Member } from '@/app/lib/types/climbing';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const member: Member | undefined = await fetchClimbingMemberById(id);

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
