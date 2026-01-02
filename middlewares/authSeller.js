import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Store from '@/models/Store';

const authSeller = async (userId) => {
    try {
        if (!userId) {
            console.log('[authSeller] No userId provided');
            return false;
        }
        await connectDB();
        
        // Look for store directly by userId (Firebase UID)
        const store = await Store.findOne({ userId: userId }).lean();
        console.log('[authSeller] Store found:', store ? `Yes (${store._id})` : 'No');
        console.log('[authSeller] Store status:', store?.status);
        
        // Allow sellers with pending, approved, or active stores to access the dashboard
        if (store && (store.status === 'approved' || store.status === 'pending' || store.isActive)) {
            return store._id.toString();
        }
        
        // Reject only if store is explicitly rejected
        if (store && store.status === 'rejected') {
            console.log('[authSeller] Store rejected');
            return false;
        }
        
        return false;
    } catch (error) {
        console.log('[authSeller] Error:', error);
        return false;
    }
}

export default authSeller