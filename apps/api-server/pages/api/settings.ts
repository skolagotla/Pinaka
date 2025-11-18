/**
 * Unified Settings API Endpoint
 * 
 * Handles both landlord and tenant settings updates
 * Consolidates /api/landlord/settings and /api/tenant/settings
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from '@/lib/middleware/apiMiddleware';
import { prisma } from '@/lib/prisma';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user) => {
  if (req.method === "GET") {
    // Return user settings based on role
    if (user.role === 'landlord') {
      const landlord = await prisma.landlord.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          provinceState: true,
          postalZip: true,
          country: true,
          timezone: true,
        }
      });
      
      if (!landlord) {
        return res.status(404).json({ error: "Landlord not found" });
      }
      
      return res.status(200).json({ landlord });
    } else {
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          provinceState: true,
          currentAddress: true,
          emergencyContactName: true,
          emergencyContactPhone: true,
          timezone: true,
        }
      });
      
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      
      return res.status(200).json({ tenant });
    }
  }

  if (req.method === "PATCH") {
    if (user.role === 'landlord') {
      const {
        firstName,
        middleName,
        lastName,
        phone,
        addressLine1,
        addressLine2,
        city,
        provinceState, // Legacy - keep for backward compat
        postalZip,
        country, // Legacy - keep for backward compat
        countryCode, // New FK field
        regionCode, // New FK field
        timezone,
      } = req.body;

      // Map country/provinceState to FKs
      const { mapCountryRegionToFKs } = require('@/lib/utils/country-region-mapper');
      const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
        country,
        provinceState,
        countryCode,
        regionCode
      );

      const updatedLandlord = await prisma.landlord.update({
        where: { id: user.userId },
        data: {
          firstName,
          middleName: middleName || null,
          lastName,
          phone: phone || null,
          addressLine1: addressLine1 || null,
          addressLine2: addressLine2 || null,
          city: city || null,
          provinceState: provinceState || null, // Legacy - keep for backward compat
          postalZip: postalZip || null,
          country: country || null, // Legacy - keep for backward compat
          countryCode: finalCountryCode || null, // New FK
          regionCode: finalRegionCode || null, // New FK
          timezone: timezone || "America/Toronto",
        },
      });

      return res.status(200).json(updatedLandlord);
    } else {
      const {
        firstName,
        lastName,
        phone,
        country, // Legacy - keep for backward compat
        provinceState, // Legacy - keep for backward compat
        countryCode, // New FK field
        regionCode, // New FK field
        currentAddress,
        emergencyContactName,
        emergencyContactPhone,
        timezone,
      } = req.body;

      // Map country/provinceState to FKs
      const { mapCountryRegionToFKs } = require('@/lib/utils/country-region-mapper');
      const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
        country,
        provinceState,
        countryCode,
        regionCode
      );

      const updatedTenant = await prisma.tenant.update({
        where: { id: user.userId },
        data: {
          firstName,
          lastName,
          phone: phone || null,
          country: country || null, // Legacy - keep for backward compat
          provinceState: provinceState || null, // Legacy - keep for backward compat
          countryCode: finalCountryCode || null, // New FK
          regionCode: finalRegionCode || null, // New FK
          currentAddress: currentAddress || null,
          emergencyContactName: emergencyContactName || null,
          emergencyContactPhone: emergencyContactPhone || null,
          timezone: timezone || "America/New_York",
        },
      });

      return res.status(200).json(updatedTenant);
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}, { allowedMethods: ['GET', 'PATCH'] });

