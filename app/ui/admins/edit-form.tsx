'use client';

import { useFormState } from 'react-dom';
import { updateAdmin } from '@/app/lib/actions/admins/actions';
import Form from './form';
import { Admin } from '@/app/lib/types/admins';

export default function EditForm({ admin }: { admin: Admin }) {
  const initialState = { message: null, errors: {} };
  const updateMemberWithId = updateAdmin.bind(null, admin.id);
  const [state, dispatch] = useFormState(updateMemberWithId, initialState);

  return <Form dispatch={dispatch} admin={admin} state={state} />;
}
