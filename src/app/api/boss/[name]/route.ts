import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Boss {
  date: string;
  high: number;
  name?: string;
  image?: string;
  tier?: string;
  lore?: string;
  index?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const bosses: Boss[] = JSON.parse(jsonData);
    
    // Find boss by name (case-insensitive)
    const bossName = decodeURIComponent(name);
    const boss = bosses.find(b => 
      b.name && b.name.toLowerCase() === bossName.toLowerCase()
    );
    
    if (!boss) {
      return NextResponse.json(
        { error: 'Boss not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(boss);
  } catch (error) {
    console.error('Error fetching boss data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boss data' },
      { status: 500 }
    );
  }
}
