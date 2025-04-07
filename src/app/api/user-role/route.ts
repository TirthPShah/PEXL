import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Security check: ensure user is authenticated
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  
  // Make sure the email in the request matches the authenticated user's email
  if (email !== session.user.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  try {
    const db = await getDatabase();
    const userRole = await db.collection('roles').findOne({ email });
    
    if (userRole) {
      return NextResponse.json({ role: userRole.role });
    } else {
      // Default role if not found
      return NextResponse.json({ role: 'customer' });
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}