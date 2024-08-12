'use client';

import { useFormState } from 'react-dom';
import {
  ClimbingState,
  createClimbingMember,
} from '@/app/lib/actions/climbing/actions';
import Form from './form';

export default function CreateForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(
    (prevState: ClimbingState, formData: FormData) =>
      createClimbingMember(prevState, formData, false),
    initialState,
  );

  return <Form dispatch={dispatch} state={state} />;
}
