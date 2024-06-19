'use client';

import { useSearchParams } from 'next/navigation';
import { useFormState } from 'react-dom';
import { validateAdmin } from '@/app/lib/actions/admins/actions';

import { Button } from '../common/button';
import { TextInput } from '../common/textInput';

export default function ValidateForm() {
  const params = useSearchParams();
  const token = params.get('token');
  const email = params.get('email');

  const initialState = { message: null, errors: {} };
  const validateAdminWithEmail = validateAdmin.bind(null, email, token);

  const [state, dispatch] = useFormState(validateAdminWithEmail, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <TextInput
          label="Mot de passe"
          idFor="password"
          settingKey="password"
          type="password"
          placeholder="Mot de passe"
          error={state.errors?.password}
        />
        <TextInput
          label="Vérifier mot de passe"
          idFor="checkPassword"
          settingKey="checkPassword"
          type="password"
          placeholder="Vérifier mot de passe"
          error={state.errors?.checkPassword}
        />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Button type="submit">Valider mot de passe</Button>
      </div>
    </form>
  );
}
