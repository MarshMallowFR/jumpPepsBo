'use client';
import { deleteMember } from '@/app/lib/actions/climbing/actions';
import { TrashIcon } from '@heroicons/react/24/outline';

interface DeleteBtnProps {
  id: string;
  imageUrl: string;
}

export function DeleteBtn({ id, imageUrl }: DeleteBtnProps) {
  const deleteMemberbyId = async () => {
    try {
      const result = await deleteMember(id, imageUrl);
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };
  return (
    <button
      id={id}
      onClick={deleteMemberbyId}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <TrashIcon className="w-5" />
    </button>
  );
}
