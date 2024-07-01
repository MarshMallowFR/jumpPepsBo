import Breadcrumbs from '../ui/common/breadcrumbs';
import FormRegistration from '@/app/ui/climbing/register-form';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Escalade', href: '/registration' },
          {
            label: `S'inscrire`,
            href: '/registration',
            active: true,
          },
        ]}
      />
      <FormRegistration />
    </main>
  );
}
