/**
 * API route to serve documentation files
 * This allows the frontend to fetch markdown files
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get('file');
  
  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 });
  }
  
  // Security: Only allow .md files from docs directory
  if (!filename.endsWith('.md') || filename.includes('..')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }
  
  try {
    // Read file from docs directory (relative to project root)
    const docsPath = join(process.cwd(), 'docs', filename);
    const content = await readFile(docsPath, 'utf-8');
    
    return NextResponse.json({ content }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error(`Error reading ${filename}:`, error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}

