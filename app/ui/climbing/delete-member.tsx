'use client';
import { deleteMemberCompletely } from '@/app/lib/actions/climbing/actions';
import { DeleteBtn } from '../common/buttons';
import { ToastType, useToastContext } from '@/app/lib/contexts/toastContext';
import { useRouter } from 'next/navigation';
interface DeleteMemberProps {
  id: string;
  imageUrl: string;
}

export default function DeleteMember({ id, imageUrl }: DeleteMemberProps) {
  const { setIsVisible, setToastType, setToastMessage } = useToastContext();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const result = await deleteMemberCompletely(id, imageUrl);
      setIsVisible(true);
      setToastType(ToastType.SUCCESS);
      setToastMessage(result.message);
      setTimeout(() => {
        router.push('/dashboard/climbing');
      }, 600);
    } catch (error: unknown) {
      setIsVisible(true);
      setToastType(ToastType.ERROR);
      if (error instanceof Error) {
        setToastMessage(error.message);
      } else {
        setToastMessage('Une erreur est survenue.');
      }
    }
  };

  return <DeleteBtn id={id} handleDeleteOrRemove={handleDelete} />;
}
