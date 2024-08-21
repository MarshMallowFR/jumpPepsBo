'use client';
import { deleteMember } from '@/app/lib/actions/climbing/actions';
import { DeleteBtn } from '../common/buttons';
import { useState } from 'react';
import { Toast } from '../common/Toast';
interface DeleteMemberProps {
  id: string;
  imageUrl: string;
}

export default function DeleteMember({ id, imageUrl }: DeleteMemberProps) {
  const [message, setMessage] = useState<string>();
  const handleDelete = async () => {
    try {
      const result = await deleteMember(id, imageUrl);
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
