'use client';

import { useFormState } from 'react-dom';
import { createClimbingMember } from '@/app/lib/actions/climbing/actions';
import Form from './form';

export default function CreateForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createClimbingMember, initialState);

  return <Form dispatch={dispatch} state={state} />;
}
