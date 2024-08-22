'use client';
import { DeleteBtn } from '../common/buttons';
import { deleteAdmin } from '@/app/lib/actions/admins/actions';
import { ToastType, useToastContext } from '@/app/lib/contexts/toastContext';

export default function DeleteAdmin({ id }: { id: string }) {
  const { setIsVisible, setToastType, setToastMessage } = useToastContext();
  const handleDelete = async () => {
    try {
      const result = await deleteAdmin(id);
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
