'use client'
import StoreLayout from "@/components/store/StoreLayout";

import { ImageKitContext } from 'imagekitio-next'
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function RootAdminLayout({ children }) {
    const { user, loading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [adminSession, setAdminSession] = useState(null);
    const router = useRouter();
    console.log('[layout.jsx] mounted:', mounted, 'loading:', loading, 'user:', user);

    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

    useEffect(() => {
        setMounted(true)
        
        // Check for admin session from username/password login
        const session = localStorage.getItem('adminSession');
        if (session) {
            try {
                const parsedSession = JSON.parse(session);
                setAdminSession(parsedSession);
            } catch (error) {
                console.error('Invalid admin session:', error);
                localStorage.removeItem('adminSession');
            }
        }
    }, [])

    const authenticator = async () => {
        try {
            const response = await fetch('/api/imagekit-auth')
            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Request failed with status ${response.status}: ${errorText}`)
            }
            const data = await response.json()
            const { signature, expire, token } = data
            return { signature, expire, token }
        } catch (error) {
            throw new Error(`Authentication request failed: ${error.message}`)
        }
    }


    // Prevent hydration mismatch
    if (!mounted || loading) {
        return null;
    }

    // Check if user is logged in either via Firebase or username/password
    if (!user && !adminSession) {
        router.push('/store/login');
        return null;
    }

    return (
        <ImageKitContext.Provider value={{ publicKey, urlEndpoint, authenticator }}>
            <StoreLayout>
                {children}
            </StoreLayout>
        </ImageKitContext.Provider>
    );
}
