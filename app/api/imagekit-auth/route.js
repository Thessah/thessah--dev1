import { ensureImageKit } from "@/configs/imageKit";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const imagekit = ensureImageKit();
        const authenticationParameters = imagekit.getAuthenticationParameters();
        console.log('✓ ImageKit auth generated:', Object.keys(authenticationParameters));
        return NextResponse.json(authenticationParameters, { status: 200 });
    } catch (error) {
        console.error("❌ Error generating ImageKit auth:", error.message);
        return NextResponse.json({ 
            error: "Failed to generate authentication",
            details: error.message 
        }, { status: 500 });
    }
}
