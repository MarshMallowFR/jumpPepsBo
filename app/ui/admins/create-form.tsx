'use client';

import { useFormState } from 'react-dom';
import { createAdmin } from '@/app/lib/actions/admins/actions';
import Form from './form';

export default function CreateForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createAdmin, initialState);

  return <Form dispatch={dispatch} state={state} />;
}
