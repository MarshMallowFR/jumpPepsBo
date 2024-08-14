'use client';

import { useState } from 'react';
import { updateClimbingMember } from '@/app/lib/actions/climbing/actions';
import Form from './form';
import { Member } from '@/app/lib/types/climbing';
import { ClimbingState } from '@/app/lib/actions/climbing/actions';

export default function EditForm({ member }: { member: Member }) {
  const initialState: ClimbingState = { message: null, errors: {} };
  const [state, setState] = useState<ClimbingState>(initialState);

  const dispatch = async (formData: FormData): Promise<ClimbingState> => {
    const newState = await updateClimbingMember(member.id, state, formData);
    setState(newState);
    return newState;
  };

  return <Form dispatch={dispatch} member={member} state={state} />;
}
