'use client'
import Link from "next/link"
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AdminNavbar = () => {
    const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
    const router = useRouter();
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsubscribe();
    }, []);
    const handleSignOut = async () => {
        await auth.signOut();
        router.push("/admin/sign-in");
    };
    if (user === undefined) {
        // Loading state: show nothing or a spinner if you want
        return null;
    }
    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <div>
                <p className="text-lg font-semibold text-slate-700">Admin Panel</p>
            </div>
            <div className="flex items-center gap-3">
                {user ? (
                    <>
                        <p>Hi, {user.displayName || user.email}</p>
                        <button onClick={handleSignOut} className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Sign Out</button>
                    </>
                ) : (
                    <p>Hi, Quickfynd</p>
                )}
            </div>
        </div>
    );
}

export default AdminNavbar