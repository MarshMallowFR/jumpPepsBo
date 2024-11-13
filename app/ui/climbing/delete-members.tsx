'use client';
import { deleteMembersCompletely } from '@/app/lib/actions/climbing/actions';
import { ToastType, useToastContext } from '@/app/lib/contexts/toastContext';
import { Button } from '../common/buttons';

interface DeleteMembersProps {
  ids: string[];
}

export default function DeleteMembers({ ids }: DeleteMembersProps) {
  const {
    setIsVisible: setToastVisible,
    setToastType,
    setToastMessage,
  } = useToastContext();

  const handleDelete = async () => {
    try {
      const result = await deleteMembersCompletely(ids);
      setToastType(ToastType.SUCCESS);
      setToastMessage(result.message);
    } catch (error: unknown) {
      console.error('Failed to delete members:', error);
      setToastType(ToastType.ERROR);
      if (error instanceof Error) {
        setToastMessage(error.message);
      } else {
        setToastMessage('Une erreur est survenue.');
      }
    }
  };

  // Plutôt créer u, bouton à part (style)
  return (
    <div className="mt-4">
      <Button onClick={handleDelete}> Suppresion multiple </Button>
    </div>
  );
}
