import Form from '@/app/ui/admins/create-form';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Admins', href: '/dashboard/admins' },
          {
            label: 'Créer admin',
            href: '/dashboard/admins/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
