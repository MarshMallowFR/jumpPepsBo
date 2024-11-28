'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { validateAdmin } from '@/app/lib/actions/admins/actions';

import { Button } from '../common/buttons';
import { TextInput } from '../common/textInput';
import ToastWrapper from '../common/toastWrapper';
import ToastContextProvider, {
  ToastType,
} from '@/app/lib/contexts/toastContext';
import { ValidateAdminState } from '@/app/lib/types/admins';

export default function ValidateForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const email = params.get('email');
  const [displayToast, setDisplayToast] = useState(false);

  const [formState, setFormState] = useState<ValidateAdminState>({
    message: null,
    errors: {
      password: [],
      checkPassword: [],
    },
    isSuccess: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { message, errors, isSuccess } = await validateAdmin(
      email,
      token,
      formState,
      formData,
    );

    setFormState((prevState) => ({
      ...prevState,
      message,
      errors: errors || {},
      isSuccess: isSuccess || false,
    }));
    setDisplayToast(true);
    if (isSuccess) {
      setTimeout(() => {
        router.push('/dashboard/climbing');
      }, 800);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          <TextInput
            label="Mot de passe"
            idFor="password"
            settingKey="password"
            type="password"
            placeholder="Mot de passe"
            error={formState?.errors?.password}
          />
          <TextInput
            label="Vérifier mot de passe"
            idFor="checkPassword"
            settingKey="checkPassword"
            type="password"
            placeholder="Vérifier mot de passe"
            error={formState?.errors?.checkPassword}
          />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button type="submit">Valider mot de passe</Button>
        </div>
      </form>
      <ToastContextProvider>
        <ToastWrapper
          visible={displayToast}
          message={formState?.message}
          toastType={formState?.isSuccess ? ToastType.SUCCESS : ToastType.ERROR}
        />
      </ToastContextProvider>
    </>
  );
}
