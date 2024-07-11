'use client';

import { useFormState } from 'react-dom';
import { updateClimbingMember } from '@/app/lib/actions/climbing/actions';
import Form from './form';
import { Member } from '@/app/lib/types/climbing';

export default function EditForm({ member }: { member: Member }) {
  const initialState = { message: null, errors: {} };
  const updateMemberWithId = updateClimbingMember.bind(null, member.id);
  const [state, dispatch] = useFormState(updateMemberWithId, initialState);

  return <Form dispatch={dispatch} member={member} state={state} />;
}
