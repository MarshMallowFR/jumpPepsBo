import { deleteMembers } from '../climbing/actions';

export const handleDeleteMembers = async (
  selectedIds: string[],
  members: { id: string; picture: string }[],
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
    return result;
  } catch (error: unknown) {
    console.error('Failed to delete members:', error);
    return { message: 'Erreur lors de la suppression des membres.' };
  }
};
