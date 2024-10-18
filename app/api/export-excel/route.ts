import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { MemberWithContactsAndSeasonBD } from '@/app/lib/types/climbing';

const excelColumns = [
  { header: 'Numéro de licence', key: 'Numéro de licence', width: 20 },
  { header: 'Nom', key: 'Nom', width: 20 },
  { header: 'Prénom', key: 'Prénom', width: 20 },
  { header: 'Date de naissance', key: 'Date de naissance', width: 15 },
  { header: 'Sexe', key: 'Sexe', width: 5 },
  { header: 'Nationalité', key: 'Nationalité', width: 15 },
  { header: 'Adresse', key: 'Adresse', width: 30 },
  { header: 'Adresse complément', key: 'Adresse complément', width: 30 },
  { header: 'Code Postal', key: 'Code Postal', width: 10 },
  { header: 'Ville', key: 'Ville', width: 20 },
  { header: 'Pays', key: 'Pays', width: 5 },
  { header: 'Tel mobile', key: 'Tel mobile', width: 15 },
  { header: 'Tel fixe', key: 'Tel fixe', width: 15 },
  { header: 'Courriel', key: 'Courriel', width: 30 },
  { header: 'Pap Nom', key: 'Pap Nom', width: 20 },
  { header: 'Pap Prénom', key: 'Pap Prénom', width: 20 },
  { header: 'Pap Tel', key: 'Pap Tel', width: 15 },
  { header: 'Pap Courriel', key: 'Pap Courriel', width: 30 },
  { header: 'Commune de naissance', key: 'Commune de naissance', width: 20 },
  {
    header: 'Département de naissance',
    key: 'Département de naissance',
    width: 25,
  },
  { header: 'Type Licence', key: 'Type Licence', width: 15 },
  { header: 'Assurance', key: 'Assurance', width: 15 },
  { header: 'Option Ski', key: 'Option Ski', width: 10 },
  { header: 'Option Slackline', key: 'Option Slackline', width: 15 },
  { header: 'Option Trail', key: 'Option Trail', width: 10 },
  { header: 'Option VTT', key: 'Option VTT', width: 10 },
  {
    header: 'Assurance Complémentaire',
    key: 'Assurance Complémentaire',
    width: 25,
  },
  {
    header: 'Option Protection Agression',
    key: 'Option Protection Agression',
    width: 25,
  },
];

function mapMemberInformations(
  membersInformations: MemberWithContactsAndSeasonBD[],
) {
  return membersInformations.map(
    ({
      license,
      last_name,
      first_name,
      birth_date,
      gender,
      nationality,
      street,
      additional_address_information,
      zip_code,
      city,
      country,
      phone_number2,
      phone_number,
      email,
      contact_last_name,
      contact_first_name,
      contact_phone_number,
      contact_email,
      birth_town,
      birth_departement,
      license_type,
      insurance,
      ski_option,
      slackline_option,
      trail_running_option,
      mountain_biking_option,
      supplemental_insurance,
      assault_protection_option,
    }) => ({
      'Numéro de licence': license,
      Nom: last_name,
      Prénom: first_name,
      'Date de naissance': birth_date,
      Sexe: gender,
      Nationalité: nationality,
      Adresse: street,
      'Adresse complément': additional_address_information,
      'Code Postal': zip_code,
      Ville: city,
      Pays: country,
      'Tel fixe': phone_number2 || '',
      'Tel mobile': phone_number,
      Courriel: email,
      'Pap Nom': contact_last_name,
      'Pap Prénom': contact_first_name,
      'Pap Tel': contact_phone_number,
      'Pap Courriel': contact_email,
      'Commune de naissance': birth_town,
      'Département de naissance': birth_departement,
      'Type Licence': license_type,
      Assurance: insurance,
      'Option Ski': ski_option === true ? 'OUI' : 'NON',
      'Option Slackline': slackline_option === true ? 'OUI' : 'NON',
      'Option Trail': trail_running_option === true ? 'OUI' : 'NON',
      'Option VTT': mountain_biking_option === true ? 'OUI' : 'NON',
      'Assurance Complémentaire': supplemental_insurance,
      'Option Protection Agression':
        assault_protection_option === true ? 'OUI' : 'NON',
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

    const queryText = `
  SELECT 
    m.last_name,
    m.first_name,
    m.birth_date,
    m.gender,
    m.nationality,
    m.street,
    m.additional_address_information,
    m.zip_code,
    m.city,
    m.country,
    m.phone_number,
    m.phone_number2,
    m.email,
    m.birth_town,
    m.birth_departement,
    c.first_name AS contact_first_name,
    c.last_name AS contact_last_name,
    c.email AS contact_email,
    c.phone_number AS contact_phone_number,
    ms.license,
    ms.license_type,
    ms.insurance,
    ms.ski_option,
    ms.slackline_option,
    ms.trail_running_option,
    ms.mountain_biking_option,
    ms.supplemental_insurance,
    ms.assault_protection_option
  FROM members m
  LEFT JOIN member_contact mc ON m.id = mc.member_id
  LEFT JOIN contacts c ON mc.first_contact_id = c.id
  LEFT JOIN member_section_season ms ON m.id = ms.member_id
  WHERE m.id = ANY($1::uuid[])
`;

    const result = await sql.query(queryText, [ids]);
    const membersInformations = result.rows;

    const renamedMembersInformations =
      mapMemberInformations(membersInformations);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Membres');

    worksheet.columns = excelColumns;

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

      row.height = rowNumber === 1 ? 25 : 20;
    });

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
