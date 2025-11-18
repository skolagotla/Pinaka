import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user) => {
  if (req.method === "GET") {
    // Get theme based on user role
    if (user.role === 'landlord') {
      const landlord = await prisma.landlord.findUnique({
        where: { id: user.userId },
        select: { theme: true },
      });
      return res.status(200).json({ theme: landlord?.theme || 'default' });
    }
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.userId },
      select: { theme: true },
    });
    return res.status(200).json({ theme: tenant?.theme || 'default' });
  }

  if (req.method === "POST") {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: "Theme is required" });
    }

    // Update theme based on user role
    if (user.role === 'landlord') {
      await prisma.landlord.update({
        where: { id: user.userId },
        data: { theme },
      });
      console.log(`[Theme API] ${user.userName} (landlord) changed theme to: ${theme}`);
    } else {
      await prisma.tenant.update({
        where: { id: user.userId },
        data: { theme },
      });
      console.log(`[Theme API] ${user.userName} (tenant) changed theme to: ${theme}`);
    }

    return res.status(200).json({ success: true, theme });
  }

  return res.status(405).json({ error: "Method not allowed" });
}, { allowedMethods: ['GET', 'POST'] });

