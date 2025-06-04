import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    
    if (!period) {
      return NextResponse.json(
        { error: 'Period parameter is required' },
        { status: 400 }
      );
    }
    
    const dataDir = join(process.cwd(), 'data', 'economic-calendar');
    
    if (!existsSync(dataDir)) {
      return NextResponse.json(
        { error: 'No data directory found' },
        { status: 404 }
      );
    }
    
    // Find the most recent CSV file for the period
    const files = readdirSync(dataDir);
    const periodFiles = files.filter(file => 
      file.startsWith(`economic-calendar-${period}-`) && file.endsWith('.csv')
    );
    
    if (periodFiles.length === 0) {
      return NextResponse.json(
        { error: `No CSV file found for period: ${period}` },
        { status: 404 }
      );
    }
    
    // Get the most recent file (sorted by filename which includes date)
    const latestFile = periodFiles.sort().reverse()[0];
    const filePath = join(dataDir, latestFile);
    
    // Read CSV content
    const csvContent = readFileSync(filePath, 'utf8');
    
    console.log(`📂 Loaded CSV file: ${filePath}`);
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  } catch (error) {
    console.error('❌ Error loading CSV file:', error);
    return NextResponse.json(
      { error: 'Failed to load CSV file' },
      { status: 500 }
    );
  }
}
