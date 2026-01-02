import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// In-memory cache
let cachedCategories = [];
let cachedHeading = {
  title: 'Find Your Perfect Match',
  subtitle: 'Shop by Categories'
};

export async function GET(req) {
  try {
    try {
      const { db } = await connectToDatabase();
      const categories = await db.collection('shopCategories')
        .find({})
        .sort({ order: 1, createdAt: -1 })
        .toArray();
      
      cachedCategories = categories;
      console.log('✓ Shop categories fetched:', categories.length);
      
      return Response.json({ 
        success: true, 
        categories: categories || [],
        heading: cachedHeading
      });
    } catch (dbError) {
      console.error('✗ MongoDB error:', dbError.message);
      console.log('→ Using cache:', cachedCategories.length, 'categories');
      return Response.json({ 
        success: true, 
        categories: cachedCategories,
        heading: cachedHeading
      });
    }
  } catch (error) {
    console.error('✗ Error:', error);
    return Response.json({ 
      success: true, 
      categories: cachedCategories,
      heading: cachedHeading
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('📝 Creating category:', body.title);
    
    const category = {
      _id: new ObjectId(),
      title: body.title || '',
      image: body.image || '',
      link: body.link || '/shop',
      order: body.order || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    cachedCategories.push(category);
    
    try {
      const { db } = await connectToDatabase();
      await db.collection('shopCategories').insertOne(category);
      console.log('✓ Category saved to MongoDB');
      return Response.json({ 
        success: true, 
        message: 'Category created successfully',
        category: category
      });
    } catch (dbError) {
      console.error('⚠ MongoDB save error:', dbError.message);
      return Response.json({ 
        success: true, 
        message: 'Category created (cached)',
        category: category
      }, { status: 200 });
    }
  } catch (error) {
    console.error('✗ Error creating category:', error);
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
