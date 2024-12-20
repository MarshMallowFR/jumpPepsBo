'use client';
import { deleteMembersCompletely } from '@/app/lib/actions/climbing/actions';
import { ToastType, useToastContext } from '@/app/lib/contexts/toastContext';
import { DeleteManyBtn } from '../common/buttons';
import { useRouter } from 'next/navigation';

interface DeleteMembersProps {
  ids: string[];
}

export default function DeleteMembers({ ids }: DeleteMembersProps) {
  const {
    setIsVisible: setToastVisible,
    setToastType,
    setToastMessage,
  } = useToastContext();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const result = await deleteMembersCompletely(ids);
      setToastVisible(true);
      setToastType(ToastType.SUCCESS);
      setToastMessage(result.message);
      const timer = setTimeout(() => {
        router.push('/dashboard/climbing');
      }, 600);
      return () => clearTimeout(timer);
    } catch (error: unknown) {
      console.error('Failed to delete members:', error);
      setToastVisible(true);
      setToastType(ToastType.ERROR);
      if (error instanceof Error) {
        setToastMessage(error.message);
      } else {
        setToastMessage('Une erreur est survenue.');
      }
    }
  };

  return (
    <div className="mt-4">
      <DeleteManyBtn onClick={handleDelete}>Suppresion multiple</DeleteManyBtn>
    </div>
  );
}
