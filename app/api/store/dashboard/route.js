import dbConnect from "@/lib/mongodb";
import { getAuth } from "@/lib/firebase-admin";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Rating from "@/models/Rating";
import AbandonedCart from "@/models/AbandonedCart";
import authSeller from "@/middlewares/authSeller";
import { NextResponse } from "next/server";

// Next.js API route handler for GET
export async function GET(request) {
   try {
      console.log('[DASHBOARD] Request received');
      
      // Get user from Firebase token
      const authHeader = request.headers.get('authorization');
      console.log('[DASHBOARD] Auth header present:', !!authHeader);
      
      let userId = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
         const idToken = authHeader.split('Bearer ')[1];
         console.log('[DASHBOARD] Token extracted, verifying...');

         try {
            const decodedToken = await getAuth().verifyIdToken(idToken);
            userId = decodedToken.uid;
            console.log('[DASHBOARD] Token verified, userId:', userId);
         } catch (e) {
            console.error('[DASHBOARD] Token verification failed:', e.message);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
         }
      } else {
         console.error('[DASHBOARD] No valid auth header');
         return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
      }

      const storeId = await authSeller(userId);
      console.log('[DASHBOARD] Store ID:', storeId);
      
      if (!storeId) {
         // User doesn't have an approved store yet - return empty dashboard
         console.log('[DASHBOARD] User has no approved store');
         return NextResponse.json({
            dashboardData: {
               ratings: [],
               totalOrders: 0,
               totalEarnings: 0,
               totalProducts: 0,
               totalCustomers: 0,
               abandonedCarts: 0
            },
            message: 'No approved store found'
         }, { status: 200 });
      }

      try {
         await dbConnect();
      } catch (dbError) {
         console.error('❌ MongoDB connection failed:', dbError.message);
         return NextResponse.json({
            dashboardData: {
               ratings: [],
               totalOrders: 0,
               totalEarnings: 0,
               totalProducts: 0,
               totalCustomers: 0,
               abandonedCarts: 0
            },
            error: 'Database connection error - returning fallback data'
         }, { status: 200 });
      }
      
      try {
         const orders = await Order.find({ storeId }).lean();

         // Get all products with ratings for seller
         const products = await Product.find({ storeId }).lean();

         const ratings = await Rating.find({
            productId: { $in: products.map(product => product._id.toString()) }
         }).lean();

         // Get unique customers who have ordered from this store
         const uniqueCustomerIds = [...new Set(orders.map(order => order.userId))];
         const totalCustomers = uniqueCustomerIds.length;

         // Get abandoned carts for this store
         const abandonedCarts = await AbandonedCart.countDocuments({ storeId });

         const dashboardData = {
            ratings,
            totalOrders: orders.length,
            totalEarnings: Math.round(orders.reduce((acc, order) => acc + (order.total || 0), 0)),
            totalProducts: products.length,
            totalCustomers,
            abandonedCarts
         };

         return NextResponse.json({ dashboardData }, { status: 200 });
      } catch (queryError) {
         console.error('❌ Query error:', queryError.message);
         return NextResponse.json({
            dashboardData: {
               ratings: [],
               totalOrders: 0,
               totalEarnings: 0,
               totalProducts: 0,
               totalCustomers: 0,
               abandonedCarts: 0
            },
            error: 'Query timeout - returning fallback data'
         }, { status: 200 });
      }
   } catch (error) {
      console.error('❌ Dashboard error:', error.message);
      return NextResponse.json({ 
         error: error.message,
         dashboardData: {
            ratings: [],
            totalOrders: 0,
            totalEarnings: 0,
            totalProducts: 0,
            totalCustomers: 0,
            abandonedCarts: 0
         }
      }, { status: 200 });
   }
}