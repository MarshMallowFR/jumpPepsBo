'use client';
import { DeleteBtn } from '../common/buttons';
import { useState } from 'react';
import { Toast } from '../common/Toast';
import { deleteAdmin } from '@/app/lib/actions/admins/actions';

export default function DeleteAdmin({ id }: { id: string }) {
  const [message, setMessage] = useState<string>();
  const handleDelete = async () => {
    try {
      const result = await deleteAdmin(id);
      setMessage(result.message);
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  return (
    <>
      <DeleteBtn id={id} handleDelete={handleDelete} />
      {message && <Toast message={message} />}
    </>
  );
}
