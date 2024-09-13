import * as XLSX from 'xlsx';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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

    const queryText = `SELECT * FROM members WHERE id = ANY($1::uuid[])`;
    const result = await sql.query(queryText, [ids]);
    const membersInformations = result.rows;

    const worksheet = XLSX.utils.json_to_sheet(membersInformations);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Membres');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

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
