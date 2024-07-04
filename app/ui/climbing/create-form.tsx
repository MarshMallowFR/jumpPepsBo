'use client';

import { useFormState } from 'react-dom';
import { createClimbingMember } from '@/app/lib/actions/climbing/actions';
import Form from './form';

export default function CreateForm() {
const initialState = { message: null, errors: {} };
const [state, dispatch] = useFormState(
  (prevState: any, formData: any) =>
    createClimbingMember(prevState, formData, false),
  initialState,
);

  return <Form dispatch={dispatch} state={state} />;
}
