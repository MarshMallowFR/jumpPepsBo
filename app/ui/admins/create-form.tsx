'use client';

import { AdminState, createAdmin } from '@/app/lib/actions/admins/actions';
import Form from './form';
import { useState } from 'react';

export default function CreateForm() {
  const initialState = { message: null, errors: {} };

  const [state, setState] = useState<AdminState>(initialState);

  const dispatch = async (formData: FormData): Promise<AdminState> => {
    const newState = await createAdmin(state, formData);
    setState(newState);
    return newState;
  };

  return <Form dispatch={dispatch} state={state} />;
}
