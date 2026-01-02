import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import User from "@/models/User";
import authAdmin from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/firebase-admin";

// Get all approved stores
export async function GET(request){
    console.log('[ADMIN STORES API] Request received');
    try {
        // Check for admin session (username/password login)
        const adminSessionHeader = request.headers.get('x-admin-session');
        
        if (adminSessionHeader) {
            // Validate admin session
            try {
                const session = JSON.parse(adminSessionHeader);
                const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
                const sessionAge = Date.now() - session.loginTime;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (session.username === adminUsername && sessionAge < maxAge) {
                    console.log('[ADMIN STORES API] Admin session validated');
                    // Skip to database query
                } else {
                    return NextResponse.json({ error: 'Invalid or expired admin session' }, { status: 401 });
                }
            } catch (e) {
                return NextResponse.json({ error: 'Invalid admin session format' }, { status: 401 });
            }
        } else {
            // Firebase Auth: Extract token from Authorization header
            const authHeader = request.headers.get('authorization');
            console.log('[ADMIN STORES API] Auth header present:', !!authHeader);
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                console.log('[ADMIN STORES API] No valid auth header');
                return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
            }
            const idToken = authHeader.split(' ')[1];
            console.log('[ADMIN STORES API] Token length:', idToken?.length);
            
            let decodedToken;
            try {
                console.log('[ADMIN STORES API] Attempting to verify token...');
                decodedToken = await getAuth().verifyIdToken(idToken);
                console.log('[ADMIN STORES API] Token verified successfully');
            } catch (e) {
                console.error('[ADMIN STORES API] Token verification failed:', e.message);
                console.error('[ADMIN STORES API] Error code:', e.code);
                return NextResponse.json({ error: 'Invalid token', details: e.message, code: e.code }, { status: 401 });
            }
            const userId = decodedToken.uid;
            const email = decodedToken.email;
            console.log('[ADMIN STORES] User attempting access:', { userId, email });
            const isAdmin = await authAdmin(userId, email);
            console.log('[ADMIN STORES] isAdmin check result:', isAdmin);
            if (!isAdmin) {
                return NextResponse.json({ error: 'not authorized', email }, { status: 401 });
            }
        }

        await dbConnect();
        const stores = await Store.find({ status: 'approved' }).lean();

        // Populate user data for each store
        for (let store of stores) {
            if (store.userId) {
                const user = await User.findById(store.userId).lean();
                store.user = user;
            }
        }

        return NextResponse.json({ stores });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}