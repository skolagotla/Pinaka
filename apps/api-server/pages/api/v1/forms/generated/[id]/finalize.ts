import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { generatedFormService } from '@/lib/domains/generated-form';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid form ID' });
    }

    const updated = await generatedFormService.updateGeneratedForm(
      id,
      { status: 'finalized' },
      user
    );

    return res.status(200).json({
      success: true,
      form: updated,
      message: 'Form finalized successfully',
    });
  } catch (error) {
    console.error('[Finalize Form] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to finalize form',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['POST'] });

