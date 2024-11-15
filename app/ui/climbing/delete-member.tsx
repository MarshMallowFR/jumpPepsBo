'use client';
import { deleteMemberCompletely } from '@/app/lib/actions/climbing/actions';
import { DeleteBtn } from '../common/buttons';
import { ToastType, useToastContext } from '@/app/lib/contexts/toastContext';
interface DeleteMemberProps {
  id: string;
  imageUrl: string;
}

export default function DeleteMember({ id, imageUrl }: DeleteMemberProps) {
  const { setIsVisible, setToastType, setToastMessage } = useToastContext();
  const handleDelete = async () => {
    try {
      const result = await deleteMemberCompletely(id, imageUrl);
      setIsVisible(true);
      setToastType(ToastType.SUCCESS);
      setToastMessage(result.message);
    } catch (error: unknown) {
      console.error('Failed to delete member:', error);
      setIsVisible(true);
      setToastType(ToastType.ERROR);
      if (error instanceof Error) {
        setToastMessage(error.message);
      } else {
        setToastMessage('Une erreur est survenue.');
      }
    }
  };

  return <DeleteBtn id={id} handleDelete={handleDelete} />;
}
