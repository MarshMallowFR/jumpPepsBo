'use client';
import { removeMemberFromSeason } from '@/app/lib/actions/climbing/actions';
import { DeleteBtn } from '../common/buttons';
import { ToastType, useToastContext } from '@/app/lib/contexts/toastContext';
interface RemoveMemberFromSeasonProps {
  memberId: string;
  seasonId: string;
}

export default function RemoveMemberFromSeason({
  memberId,
  seasonId,
}: RemoveMemberFromSeasonProps) {
  const { setIsVisible, setToastType, setToastMessage } = useToastContext();
  const handleRemove = async () => {
    try {
      console.log('RemoveMemberFromSeason needs to be reviewed');
      const result = await removeMemberFromSeason(memberId, seasonId);
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

  return <DeleteBtn id={memberId} handleDelete={handleRemove} />;
}
