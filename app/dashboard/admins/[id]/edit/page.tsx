import { notFound } from 'next/navigation';
import Form from '@/app/ui/admins/edit-form';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import { fetchAdminById } from '@/app/lib/data';
import { Admin } from '@/app/lib/types/admins';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const admin: Admin | undefined = await fetchAdminById(id);

  if (!admin) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admin', href: '/dashboard/admins' },
          {
            label: 'Editer un admin',
            href: `/dashboard/admins/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form admin={admin} />
    </main>
  );
}
