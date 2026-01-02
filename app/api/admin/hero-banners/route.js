import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const banners = await db.collection('heroBanners').find({}).toArray();
    return Response.json({ success: true, banners: banners || [] });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Check for admin session or Firebase token
    const adminSession = req.headers.get('x-admin-session');
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    
    if (!adminSession && !token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Validate admin session if provided
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
        const sessionAge = Date.now() - session.loginTime;
        const maxAge = 24 * 60 * 60 * 1000;
        
        if (session.username !== adminUsername || sessionAge >= maxAge) {
          return Response.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
        }
      } catch (e) {
        return Response.json({ success: false, error: 'Invalid session format' }, { status: 401 });
      }
    }
    
    const { db } = await connectToDatabase();
    const formData = await req.formData();
    
    const banner = {
      badge: formData.get('badge') || '',
      subtitle: formData.get('subtitle') || '',
      title: formData.get('title') || '',
      description: formData.get('description') || '',
      cta: formData.get('cta') || '',
      link: formData.get('link') || '',
      image: formData.get('image') || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle image upload
    const file = formData.get('imageFile');
    if (file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Save to public folder
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners');
        await mkdir(uploadDir, { recursive: true });
        
        const filename = `banner-${Date.now()}-${file.name}`;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        
        banner.image = `/uploads/banners/${filename}`;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue without image if upload fails
      }
    }

    const result = await db.collection('heroBanners').insertOne(banner);
    return Response.json({ success: true, banner: { _id: result.insertedId, ...banner } });
  } catch (error) {
    console.error('Error creating banner:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    // Check for admin session or Firebase token
    const adminSession = req.headers.get('x-admin-session');
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    
    if (!adminSession && !token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Validate admin session if provided
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
        const sessionAge = Date.now() - session.loginTime;
        const maxAge = 24 * 60 * 60 * 1000;
        
        if (session.username !== adminUsername || sessionAge >= maxAge) {
          return Response.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
        }
      } catch (e) {
        return Response.json({ success: false, error: 'Invalid session format' }, { status: 401 });
      }
    }

    const { db } = await connectToDatabase();
    const formData = await req.formData();
    const bannerId = formData.get('id');

    const banner = {
      badge: formData.get('badge') || '',
      subtitle: formData.get('subtitle') || '',
      title: formData.get('title') || '',
      description: formData.get('description') || '',
      cta: formData.get('cta') || '',
      link: formData.get('link') || '',
      updatedAt: new Date()
    };

    // Handle image upload
    const file = formData.get('imageFile');
    if (file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners');
        await mkdir(uploadDir, { recursive: true });
        const filename = `banner-${Date.now()}-${file.name}`;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        banner.image = `/uploads/banners/${filename}`;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
      }
    }

    const result = await db.collection('heroBanners').updateOne(
      { _id: new ObjectId(bannerId) },
      { $set: banner }
    );

    return Response.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating banner:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    // Check for admin session or Firebase token
    const adminSession = req.headers.get('x-admin-session');
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    
    if (!adminSession && !token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Validate admin session if provided
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
        const sessionAge = Date.now() - session.loginTime;
        const maxAge = 24 * 60 * 60 * 1000;
        
        if (session.username !== adminUsername || sessionAge >= maxAge) {
          return Response.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
        }
      } catch (e) {
        return Response.json({ success: false, error: 'Invalid session format' }, { status: 401 });
      }
    }

    const { db } = await connectToDatabase();
    const { id } = await req.json();

    const result = await db.collection('heroBanners').deleteOne({ _id: new ObjectId(id) });
    return Response.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
