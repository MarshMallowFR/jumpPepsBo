import Link from 'next/link';

import { AdminState } from '@/app/lib/actions/admins/actions';
import { Admin } from '@/app/lib/types/admins';
import { Button } from '../common/buttons';
import { TextInput } from '../common/TextInput';
import Status from '../climbing/status';

interface FormProps {
  dispatch: (payload: FormData) => void;
  admin?: Admin;
  state: AdminState;
}

export default function Form({ state, dispatch, admin }: Readonly<FormProps>) {
  return (
    <form action={dispatch}>
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
          <label htmlFor="validated" className="mb-2 block text-sm font-medium">
            Validé
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <Status isValid={admin?.validated || false} />
            </div>
          </div>
        </div>
        {state.message ? (
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/admins"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Annuler
        </Link>
        <Button type="submit">
          {admin ? 'Editer admin' : 'Envoyer invitation'}
        </Button>
      </div>
    </form>
  );
}
