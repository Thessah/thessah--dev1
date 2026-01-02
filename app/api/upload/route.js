import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to ImageKit
    const response = await imagekit.upload({
      file: buffer,
      fileName: `blog-${Date.now()}-${file.name}`,
      folder: '/blog-uploads/',
    });

    return Response.json({
      success: true,
      url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
