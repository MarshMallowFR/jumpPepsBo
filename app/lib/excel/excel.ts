export async function downloadExcel(ids: string[]) {
  const query = ids.join(',');
  const response = await fetch(`/api/export-excel?ids=${query}`);

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Membres.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();

    return { success: true, message: 'Exportation réussie !' };
  } else {
    throw new Error('Erreur lors du téléchargement du fichier.');
  }
}
