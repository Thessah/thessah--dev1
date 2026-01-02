import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, loginTime } = await request.json();
    
    // Check credentials
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    
    // Verify username matches and session is not expired (24 hours)
    const sessionAge = Date.now() - loginTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (username === adminUsername && sessionAge < maxAge) {
      return NextResponse.json({ 
        isAdmin: true,
        message: 'Session valid'
      });
    } else {
      return NextResponse.json({ 
        isAdmin: false,
        message: 'Invalid or expired session'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Verify admin error:', error);
    return NextResponse.json({ 
      isAdmin: false,
      message: 'Verification failed'
    }, { status: 500 });
  }
}
