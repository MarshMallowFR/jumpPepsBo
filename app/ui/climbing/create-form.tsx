'use client';

import { useState } from 'react';
import {
  ClimbingState,
  createClimbingMember,
} from '@/app/lib/actions/climbing/actions';
import Form from './form';

export default function CreateForm() {
  const initialState: ClimbingState = {
    isSuccess: undefined,
    errors: {},
    message: null,
  };
  const [state, setState] = useState<ClimbingState>(initialState);

  const dispatch = async (formData: FormData): Promise<ClimbingState> => {
    const newState = await createClimbingMember(state, formData, false);
    setState(newState);
    return newState;
  };

  return <Form dispatch={dispatch} state={state} />;
}
