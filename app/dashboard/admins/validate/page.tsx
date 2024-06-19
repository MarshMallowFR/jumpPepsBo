import Form from '@/app/ui/admins/validate-form';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Valider compte',
            href: '/dashboard/admins/validate',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
