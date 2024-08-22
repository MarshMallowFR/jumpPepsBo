'use client';
import { DeleteBtn } from '../common/buttons';
import { useState } from 'react';
import { Toast } from '../common/Toast';
import { deleteAdmin } from '@/app/lib/actions/admins/actions';
import { useToastContext } from '@/app/lib/contexts/ToastContext';

export default function DeleteAdmin({ id }: { id: string }) {
  const [message, setMessage] = useState<string>();
  const { setIsVisible, setToastType, setToastMessage } = useToastContext();
  const handleDelete = async () => {
    try {
      const result = await deleteAdmin(id);
      setMessage(result.message);
      setIsVisible(true);
      setToastType('success');
      setToastMessage(result.message);
    } catch (error: any) {
      console.error('Failed to delete member:', error);
      setIsVisible(true);
      setToastType('error');
      setToastMessage(error.message);
    }
  };

  return (
    <>
      <DeleteBtn id={id} handleDelete={handleDelete} />
      {/* {message && <Toast message={message} />} */}
    </>
  );
}
