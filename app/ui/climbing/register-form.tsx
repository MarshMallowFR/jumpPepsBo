'use client';

import { useFormState } from 'react-dom';
import { createClimbingMember } from '@/app/lib/actions/climbing/actions';
import FormRegistration from './FormRegistration';

export default function RegisterForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(
    (prevState: any, formData: any) =>
      createClimbingMember(prevState, formData, true),
    initialState,
  );
  //console.log('register-form.tsx:', state); renvoie : {message: 'Database Error: Failed to create a member.'}
  return <FormRegistration dispatch={dispatch} state={state} />;
}
