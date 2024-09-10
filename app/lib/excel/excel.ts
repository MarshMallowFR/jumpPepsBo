import * as XLSX from 'xlsx';

export async function generateExcel(members: any[]) {
  if (!XLSX || !XLSX.utils) {
    console.error('XLSX or XLSX.utils is undefined');
    throw new Error('Erreur de configuration de la bibliothèque XLSX');
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(members); //nouv feuille de calcul
    const workbook = XLSX.utils.book_new(); // nouv classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Membres'); //ajout feuille de calcul au classeur
    const excelData = XLSX.write(workbook, {
      type: 'buffer', // génère un buffer binaire
      bookType: 'xlsx', // Spécifie que le fichier est un fichier Excel (.xlsx)
    });
    return excelData;
  } catch (error) {
    console.error('Erreur lors de la génération du fichier Excel:', error);
    throw error;
  }
}
