'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"


import axios from "axios"
import { useAuth } from "@/lib/useAuth";

const StoreLayout = ({ children }) => {

    const { user, loading, getToken } = useAuth();

    const [isSeller, setIsSeller] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sellerLoading, setSellerLoading] = useState(true);
    const [storeInfo, setStoreInfo] = useState(null);

    const fetchIsSeller = async () => {
        if (!user) return;
        try {
            // Only allow access to thessahjewellery@gmail.com
            const allowedEmail = 'thessahjewellery@gmail.com';
            const isAuthorized = user.email === allowedEmail;
            
            if (!isAuthorized) {
                console.log('[StoreLayout] Unauthorized email:', user.email);
                setIsSeller(false);
                setIsAdmin(false);
                setSellerLoading(false);
                return;
            }
            
            const token = await getToken(true); // Force refresh token
            if (!token) {
                console.log('[StoreLayout] No token available');
                setSellerLoading(false);
                return;
            }
            
            console.log('[StoreLayout] Authorized email - checking store status');
            const { data } = await axios.get('/api/store/is-seller', { 
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[StoreLayout] /api/store/is-seller response:', data);
            setIsSeller(data.isSeller);
            setStoreInfo(data.storeInfo);
            setIsAdmin(true); // This email is the admin
        } catch (error) {
            console.log('[StoreLayout] is-seller error:', error?.response?.data || error.message);
            setIsSeller(false);
        } finally {
            setSellerLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchIsSeller();
        }
    }, [loading, user]);

    return (loading || sellerLoading) ? (
        <Loading />
    ) : !user ? (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">Authentication Required</h1>
            <p className="text-slate-500 mt-4 mb-8">Please sign in to access the store dashboard</p>
            <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-4 p-2 px-6 max-sm:text-sm rounded-full">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    ) : (isSeller || isAdmin) ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar storeInfo={storeInfo} isAdmin={isAdmin} />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo} isAdmin={isAdmin} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">Access Restricted</h1>
            <p className="text-slate-500 mt-4 mb-6">This dashboard is only accessible to the store owner (thessahjewellery@gmail.com)</p>
            <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-4 p-2 px-6 max-sm:text-sm rounded-full">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default StoreLayout