import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = [];
    const urls = [];

    // Extract all files from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { message: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'trades');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Process each file
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${user.userId}_${timestamp}_${randomString}.${extension}`;

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write file to uploads directory
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      // Add URL to response
      urls.push(`/uploads/trades/${filename}`);
    }

    return NextResponse.json({
      message: 'Images uploaded successfully',
      urls,
      count: urls.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
