import { NextApiRequest, NextApiResponse } from "next";
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid landlord ID" });
  }

  // Verify the landlord belongs to the logged-in user
  const existingLandlord = await prisma.landlord.findUnique({
    where: { id },
  });

  if (!existingLandlord) {
    return res.status(404).json({ error: "Landlord not found" });
  }

  if (existingLandlord.email !== user.email) {
    return res.status(403).json({ error: "Forbidden: You can only update your own profile" });
  }

  const {
    firstName,
    middleName,
    lastName,
    phone,
    addressLine1,
    addressLine2,
    city,
    country, // Legacy - keep for backward compat
    provinceState, // Legacy - keep for backward compat
    countryCode, // New FK field
    regionCode, // New FK field
    postalZip,
    timezone,
  } = req.body;

  // Special case: Timezone-only update (no validation required)
  if (timezone && Object.keys(req.body).length === 1) {
    const updatedLandlord = await prisma.landlord.update({
      where: { id },
      data: { timezone },
    });
    return res.status(200).json(updatedLandlord);
  }

  // Validation for full profile updates
  if (!firstName || !lastName || !phone || !addressLine1 || !city || !postalZip) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate phone format (should be 10 digits)
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length !== 10) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  // Map country/provinceState to FKs
  const { mapCountryRegionToFKs } = require('@/lib/utils/country-region-mapper');
  const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
    country,
    provinceState,
    countryCode,
    regionCode
  );

  // Validate postal/zip code based on country (use countryCode if available, fallback to country)
  const countryForValidation = finalCountryCode || country;
  if (countryForValidation === "CA") {
    const postalRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
    if (!postalRegex.test(postalZip.replace(/\s/g, ""))) {
      return res.status(400).json({ error: "Invalid Canadian postal code" });
    }
  } else if (countryForValidation === "US") {
    if (!/^\d{5}$/.test(postalZip)) {
      return res.status(400).json({ error: "Invalid US ZIP code" });
    }
  }

  // Update landlord
  const updatedLandlord = await prisma.landlord.update({
    where: { id },
    data: {
      firstName,
      middleName: middleName || null,
      lastName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      provinceState: provinceState || null, // Legacy - keep for backward compat
      postalZip,
      country: country || null, // Legacy - keep for backward compat
      countryCode: finalCountryCode || null, // New FK
      regionCode: finalRegionCode || null, // New FK
      timezone: timezone || "America/Toronto",
    },
  });

  return res.status(200).json(updatedLandlord);
}, { allowedMethods: ['PATCH'], requireRole: 'landlord' });

