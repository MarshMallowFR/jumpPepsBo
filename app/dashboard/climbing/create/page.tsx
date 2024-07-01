import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import Form from '@/app/ui/climbing/create-form';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Escalade', href: '/dashboard/climbing' },
          {
            label: 'Créer membre',
            href: '/dashboard/climbing/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
