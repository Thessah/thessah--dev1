import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Rating from "@/models/Rating";
import AbandonedCart from "@/models/AbandonedCart";
import authSeller from "@/middlewares/authSeller";
import { NextResponse } from "next/server";

// Next.js API route handler for GET
export async function GET(request) {
   try {
      let isAdmin = false;
      
      // Check for admin session (username/password login)
      const adminSessionHeader = request.headers.get('x-admin-session');
      
      if (adminSessionHeader) {
         try {
            const session = JSON.parse(adminSessionHeader);
            const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
            const sessionAge = Date.now() - session.loginTime;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (session.username === adminUsername && sessionAge < maxAge) {
               isAdmin = true;
            } else {
               return NextResponse.json({ error: 'Invalid or expired admin session' }, { status: 401 });
            }
         } catch (e) {
            return NextResponse.json({ error: 'Invalid admin session format' }, { status: 401 });
         }
      } else {
         // Firebase Auth: Extract token from Authorization header
         const authHeader = request.headers.get('authorization');
         if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
         }
         const idToken = authHeader.split('Bearer ')[1];
         const { getAuth } = await import('firebase-admin/auth');
         const { initializeApp, applicationDefault, getApps } = await import('firebase-admin/app');
         if (getApps().length === 0) {
            initializeApp({ credential: applicationDefault() });
         }
         let decodedToken;
         try {
            decodedToken = await getAuth().verifyIdToken(idToken);
         } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
         }
         const userId = decodedToken.uid;
         const email = decodedToken.email;
         
         // Check if user is admin
         const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',').map(e => e.trim());
         isAdmin = adminEmails.includes(email);
         
         if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
         }
      }

      const storeId = 'admin-store'; // Use a fixed storeId for admin

      await dbConnect();
      // Get all orders for seller
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

      return NextResponse.json({ dashboardData });
   } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.code || error.message }, { status: 400 });
   }
}