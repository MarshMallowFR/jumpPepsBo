'use client';
import { removeMemberFromSeason } from '@/app/lib/actions/climbing/actions';
import { RemoveBtn } from '../common/buttons';
import { ToastType, useToastContext } from '@/app/lib/contexts/toastContext';
interface RemoveMemberFromSeasonProps {
  memberId: string;
  seasonId: string | null;
}

export default function RemoveMemberFromSeason({
  memberId,
  seasonId,
}: RemoveMemberFromSeasonProps) {
  const { setIsVisible, setToastType, setToastMessage } = useToastContext();
  const handleRemove = async () => {
    if (seasonId) {
      await removeMemberFromSeason(memberId, seasonId)
        .then((result) => {
          setIsVisible(true);
          setToastType(ToastType.SUCCESS);
          setToastMessage(result.message);
        })
        .catch((error) => {
          console.error('Failed to delete member:', error);
          setIsVisible(true);
          setToastType(ToastType.ERROR);
          if (error instanceof Error) {
            setToastMessage(error.message);
          } else {
            setToastMessage('Une erreur est survenue.');
          }
        });
    }
  };

  return <RemoveBtn id={memberId} handleDeleteOrRemove={handleRemove} />;
}
