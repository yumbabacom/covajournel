import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { csvContent, filename } = await request.json();
    
    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data', 'economic-calendar');
    mkdirSync(dataDir, { recursive: true });
    
    // Save CSV file
    const filePath = join(dataDir, filename);
    writeFileSync(filePath, csvContent, 'utf8');
    
    console.log(`✅ CSV file saved: ${filePath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'CSV file saved successfully',
      filename,
      path: filePath
    });
  } catch (error) {
    console.error('❌ Error saving CSV file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save CSV file' },
      { status: 500 }
    );
  }
}
