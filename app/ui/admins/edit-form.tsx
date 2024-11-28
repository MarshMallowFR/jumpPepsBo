'use client';

import { updateAdmin } from '@/app/lib/actions/admins/actions';
import Form from './form';
import { Admin, AdminState } from '@/app/lib/types/admins';
import { useState } from 'react';

export default function EditForm({ admin }: { admin: Admin }) {
  const initialState = { message: null, errors: {}, isSuccess: false };
  const [state, setState] = useState<AdminState>(initialState);

  const dispatch = async (formData: FormData): Promise<AdminState> => {
    const newState = await updateAdmin(admin.id, state, formData);
    setState(newState);
    return newState;
  };

  return <Form dispatch={dispatch} admin={admin} state={state} />;
}
