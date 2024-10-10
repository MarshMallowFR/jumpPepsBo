import { NextResponse } from 'next/server';
import {
  fetchMembersBySeason,
  fetchMembersWithContactsBySeason,
} from '@/app/lib/data';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');

    if (!seasonId) {
      return NextResponse.json(
        { error: 'Season ID is required' },
        { status: 400 },
      );
    }

    const members = await fetchMembersWithContactsBySeason(seasonId);
    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error('Error fetching members from PostgreSQL:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
