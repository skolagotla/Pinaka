import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * Logout endpoint for email/password users (PT DB testing)
 * Clears the auth0_test_email cookie and redirects to home
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Clear the test session cookie
    const cookie = serialize('auth0_test_email', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully',
      redirect: '/' // Redirect to home/login page
    });
  } catch (error: any) {
    console.error('[Auth Logout] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to logout',
      message: error?.message || 'Unknown error'
    });
  }
}

