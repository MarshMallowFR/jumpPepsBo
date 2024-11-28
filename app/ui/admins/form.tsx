import Link from 'next/link';

import { Admin, AdminState } from '@/app/lib/types/admins';
import { Button } from '../common/buttons';
import { TextInput } from '../common/textInput';
import Status from '../climbing/status';
import { useRouter } from 'next/navigation';
import ToastWrapper from '../common/toastWrapper';
import ToastContextProvider, {
  ToastType,
} from '@/app/lib/contexts/toastContext';
import { useEffect, useState } from 'react';

interface FormProps {
  dispatch: (payload: FormData) => Promise<AdminState>;
  admin?: Admin;
  state: AdminState;
}

export default function Form({ state, dispatch, admin }: Readonly<FormProps>) {
  const router = useRouter();
  const [displayToast, setDisplayToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (state?.isSuccess) {
      const timer = setTimeout(() => {
        router.push('/dashboard/admins');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state?.isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await dispatch(formData);
      setDisplayToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          <TextInput
            defaultValue={admin?.firstName}
            label="Prénom"
            idFor="firstName"
            settingKey="firstName"
            error={state.errors?.firstName}
          />
          <TextInput
            defaultValue={admin?.lastName}
            error={state.errors?.lastName}
            idFor="lastName"
            label="Nom"
            settingKey="lastName"
          />
          <TextInput
            defaultValue={admin?.email}
            label="Email"
            idFor="email"
            settingKey="email"
            error={state.errors?.email}
          />
          <div className="mb-4">
            <label
              htmlFor="validated"
              className="mb-2 block text-sm font-medium"
            >
              Validé
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <Status isValid={admin?.validated || false} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/admins"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Annuler
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Traitement en cours...'
              : admin
                ? 'Editer membre'
                : 'Créer membre'}
          </Button>
        </div>
      </form>
      <ToastContextProvider>
        <ToastWrapper
          visible={displayToast}
          message={state?.message}
          toastType={state?.isSuccess ? ToastType.SUCCESS : ToastType.ERROR}
        />
      </ToastContextProvider>
    </>
  );
}
