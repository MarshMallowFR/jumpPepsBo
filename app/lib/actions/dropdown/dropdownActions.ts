import { deleteMembers } from '../climbing/actions';
import { ToastType } from '../../contexts/toastContext';

export const handleDeleteMembers = async (
  selectedIds: string[],
  members: { id: string; picture: string }[],
  { setToastVisible, setToastType, setToastMessage }: any,
) => {
  const idsWithImages = selectedIds.map((id) => {
    const member = members.find((member) => member.id === id);
    return {
      id,
      imageUrl: member ? member.picture : '',
    };
  });

  try {
    const result = await deleteMembers(idsWithImages);
    setToastVisible(true);
    setToastType(ToastType.SUCCESS);
    setToastMessage(result.message);
  } catch (error: unknown) {
    console.error('Failed to delete members:', error);
    setToastVisible(true);
    setToastType(ToastType.ERROR);
    setToastMessage(
      error instanceof Error ? error.message : 'Une erreur est survenue.',
    );
  }
};
