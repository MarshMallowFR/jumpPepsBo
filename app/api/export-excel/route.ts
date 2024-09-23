// import ExcelJS from 'exceljs';
// import { NextResponse } from 'next/server';
// import { sql } from '@vercel/postgres';

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const ids = searchParams.get('ids')?.split(',') || [];

//     if (ids.length === 0) {
//       return NextResponse.json(
//         { message: "Aucun membre sélectionné pour l'export." },
//         { status: 400 },
//       );
//     }

//     const queryText = `SELECT
//     last_name,
//     first_name,
//     birth_date,
//     email,
//     phone_number,
//     street,
//     zip_code,
//     city,
//     has_paid
//     FROM members WHERE id = ANY($1::uuid[])`;
//     const result = await sql.query(queryText, [ids]);
//     const membersInformations = result.rows;

//     const renamedMembersInformations = membersInformations.map(
//       ({
//         last_name,
//         first_name,
//         birth_date,
//         email,
//         phone_number,
//         street,
//         zip_code,
//         city,
//       }) => ({
//         Nom: last_name,
//         Prénom: first_name,
//         'Date de naissance': birth_date,
//         Email: email,
//         Téléphone: phone_number,
//         Adresse: street,
//         'Code Postal': zip_code,
//         Ville: city,
//       }),
//     );

//     // Création du classeur Excel
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Membres');

//     // Columns +  rows + style
//     worksheet.columns = [
//       { header: 'Nom', key: 'Nom', width: 20 },
//       { header: 'Prénom', key: 'Prénom', width: 20 },
//       { header: 'Date de naissance', key: 'Date de naissance', width: 15 },
//       { header: 'Email', key: 'Email', width: 30 },
//       { header: 'Téléphone', key: 'Téléphone', width: 15 },
//       { header: 'Adresse', key: 'Adresse', width: 30 },
//       { header: 'Code Postal', key: 'Code Postal', width: 10 },
//       { header: 'Ville', key: 'Ville', width: 20 },
//     ];

//     renamedMembersInformations.forEach((member) => {
//       const row = worksheet.addRow(member);
//       if (member['Date de naissance']) {
//         const birthDateCell = row.getCell('Date de naissance');
//         birthDateCell.numFmt = 'dd/mm/yyyy';
//       }
//     });

//     worksheet.eachRow((row, rowNumber) => {
//       row.eachCell((cell) => {
//         cell.alignment = { horizontal: 'center', vertical: 'middle' };
//       });

//       if (rowNumber === 1) {
//         row.height = 25;
//       } else {
//         row.height = 20;
//       }
//     });

//     // Générer le fichier Excel en mémoire
//     const buffer = await workbook.xlsx.writeBuffer();

//     const response = new NextResponse(buffer, {
//       headers: {
//         'Content-Disposition': 'attachment; filename="Membres.xlsx"',
//         'Content-Type':
//           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       },
//     });

//     return response;
//   } catch (error) {
//     console.error('Erreur lors de la génération du fichier Excel:', error);
//     return NextResponse.json(
//       { message: "Erreur lors de l'export des membres." },
//       { status: 500 },
//     );
//   }
// }

import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { MemberDB } from '@/app/lib/types/climbing';

// Colonnes Excel définies en dehors de la fonction GET
const excelColumns = [
  { header: 'Nom', key: 'Nom', width: 20 },
  { header: 'Prénom', key: 'Prénom', width: 20 },
  { header: 'Date de naissance', key: 'Date de naissance', width: 15 },
  { header: 'Email', key: 'Email', width: 30 },
  { header: 'Téléphone', key: 'Téléphone', width: 15 },
  { header: 'Adresse', key: 'Adresse', width: 30 },
  { header: 'Code Postal', key: 'Code Postal', width: 10 },
  { header: 'Ville', key: 'Ville', width: 20 },
];

// Fonction de mapping des informations
function mapMemberInformations(membersInformations: MemberDB[]): Array<{
  Nom: string;
  Prénom: string;
  'Date de naissance': string;
  Email: string;
  Téléphone: string;
  Adresse: string;
  'Code Postal': string;
  Ville: string;
}> {
  return membersInformations.map(
    ({
      last_name,
      first_name,
      birth_date,
      email,
      phone_number,
      street,
      zip_code,
      city,
    }) => ({
      Nom: last_name,
      Prénom: first_name,
      'Date de naissance': birth_date,
      Email: email,
      Téléphone: phone_number,
      Adresse: street,
      'Code Postal': zip_code,
      Ville: city,
    }),
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',') || [];

    if (ids.length === 0) {
      return NextResponse.json(
        { message: "Aucun membre sélectionné pour l'export." },
        { status: 400 },
      );
    }

    const queryText = `SELECT 
    last_name,
    first_name,
    birth_date,
    email,
    phone_number,
    street,
    zip_code,
    city,
    has_paid 
    FROM members WHERE id = ANY($1::uuid[])`;
    const result = await sql.query(queryText, [ids]);
    const membersInformations = result.rows;

    // Utiliser la fonction map pour formater les données des membres
    const renamedMembersInformations =
      mapMemberInformations(membersInformations);

    // Création du classeur Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Membres');

    // Utiliser les colonnes externalisées
    worksheet.columns = excelColumns;

    // Ajouter les lignes avec les données formatées
    renamedMembersInformations.forEach((member) => {
      const row = worksheet.addRow(member);
      if (member['Date de naissance']) {
        const birthDateCell = row.getCell('Date de naissance');
        birthDateCell.numFmt = 'dd/mm/yyyy';
      }
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      if (rowNumber === 1) {
        row.height = 25;
      } else {
        row.height = 20;
      }
    });

    // Générer le fichier Excel en mémoire
    const buffer = await workbook.xlsx.writeBuffer();

    const response = new NextResponse(buffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="Membres.xlsx"',
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    return response;
  } catch (error) {
    console.error('Erreur lors de la génération du fichier Excel:', error);
    return NextResponse.json(
      { message: "Erreur lors de l'export des membres." },
      { status: 500 },
    );
  }
}
