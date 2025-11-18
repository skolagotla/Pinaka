import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import PartnersClient from './ui';

/**
 * Unified Partners Page
 * Consolidates Vendors and Contractors functionality
 * Works for all roles: PMC, Landlord
 */
export default withAuth(async ({ user, userRole, prisma }) => {
  let vendorsData = null;
  let contractorsData = null;
  
  if (userRole === 'landlord') {
    // Load vendors data through LandlordServiceProvider relationship
    try {
      const landlordProviders = await prisma.landlordServiceProvider.findMany({
        where: {
          landlordId: user.id,
          provider: {
            type: 'vendor',
          },
        },
        include: {
          provider: true,
        },
        orderBy: { addedAt: 'desc' },
      });

      // Also get global vendors
      const globalVendors = await prisma.serviceProvider.findMany({
        where: {
          type: 'vendor',
          isGlobal: true,
          isDeleted: false,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Combine and deduplicate
      const localProviderIds = new Set(landlordProviders.map(lp => lp.providerId));
      const allVendors = [
        ...landlordProviders.map(lp => ({
          id: lp.provider.id,
          vendorId: lp.provider.providerId,
          name: lp.provider.name,
          businessName: lp.provider.businessName,
          phone: lp.provider.phone,
          email: lp.provider.email,
          category: lp.provider.category || '',
          rating: lp.provider.rating,
          hourlyRate: lp.provider.hourlyRate,
          notes: lp.provider.notes,
          addressLine1: lp.provider.addressLine1,
          addressLine2: lp.provider.addressLine2,
          city: lp.provider.city,
          provinceState: lp.provider.provinceState,
          postalZip: lp.provider.postalZip,
          country: lp.provider.country,
          countryCode: lp.provider.countryCode,
          regionCode: lp.provider.regionCode,
          latitude: lp.provider.latitude,
          longitude: lp.provider.longitude,
          isGlobal: lp.provider.isGlobal,
          isActive: lp.provider.isActive,
          isDeleted: lp.provider.isDeleted,
          createdAt: lp.provider.createdAt,
          updatedAt: lp.provider.updatedAt,
          addedAt: lp.addedAt,
          addedBy: lp.addedBy,
        })),
        ...globalVendors.filter(v => !localProviderIds.has(v.id)).map(v => ({
          id: v.id,
          vendorId: v.providerId,
          name: v.name,
          businessName: v.businessName,
          phone: v.phone,
          email: v.email,
          category: v.category || '',
          rating: v.rating,
          hourlyRate: v.hourlyRate,
          notes: v.notes,
          addressLine1: v.addressLine1,
          addressLine2: v.addressLine2,
          city: v.city,
          provinceState: v.provinceState,
          postalZip: v.postalZip,
          country: v.country,
          countryCode: v.countryCode,
          regionCode: v.regionCode,
          latitude: v.latitude,
          longitude: v.longitude,
          isGlobal: v.isGlobal,
          isActive: v.isActive,
          isDeleted: v.isDeleted,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
          addedAt: null,
          addedBy: null,
        })),
      ];

      vendorsData = {
        vendors: allVendors.map(v => serializePrismaData(v)),
      };
    } catch (error) {
      console.error('[Partners Page] Error loading vendors data:', error);
    }

    // Load contractors data
    try {
      const landlordProviders = await prisma.landlordServiceProvider.findMany({
        where: {
          landlordId: user.id,
          provider: {
            type: 'contractor',
          },
        },
        include: {
          provider: true,
        },
        orderBy: { addedAt: 'desc' },
      });

      contractorsData = {
        contractors: landlordProviders.map(lp => serializePrismaData({
          id: lp.provider.id,
          contractorId: lp.provider.providerId,
          companyName: lp.provider.name,
          contactName: lp.provider.contactName,
          licenseNumber: lp.provider.licenseNumber,
          email: lp.provider.email,
          phone: lp.provider.phone,
          specialties: lp.provider.specialties || [],
          addressLine1: lp.provider.addressLine1,
          addressLine2: lp.provider.addressLine2,
          city: lp.provider.city,
          provinceState: lp.provider.provinceState,
          postalZip: lp.provider.postalZip,
          country: lp.provider.country,
          countryCode: lp.provider.countryCode,
          regionCode: lp.provider.regionCode,
          latitude: lp.provider.latitude,
          longitude: lp.provider.longitude,
          rating: lp.provider.rating,
          hourlyRate: lp.provider.hourlyRate,
          notes: lp.provider.notes,
          isGlobal: lp.provider.isGlobal,
          isActive: lp.provider.isActive,
          isDeleted: lp.provider.isDeleted,
          createdAt: lp.provider.createdAt,
          updatedAt: lp.provider.updatedAt,
          addedAt: lp.addedAt,
          addedBy: lp.addedBy,
        })),
      };
    } catch (error) {
      console.error('[Partners Page] Error loading contractors data:', error);
    }
  } else if (userRole === 'pmc') {
    // Load PMC vendors data
    try {
      const pmcRelationships = await prisma.pMCLandlord.findMany({
        where: {
          pmcId: user.id,
          status: 'active',
        },
        select: { landlordId: true },
      });

      const landlordIds = pmcRelationships.map(rel => rel.landlordId);

      if (landlordIds.length > 0) {
        // Load vendors through LandlordServiceProvider relationships
        const landlordProviders = await prisma.landlordServiceProvider.findMany({
          where: {
            landlordId: { in: landlordIds },
            provider: {
              type: 'vendor',
            },
          },
          include: {
            provider: true,
          },
          orderBy: { addedAt: 'desc' },
        });

        // Also get global vendors
        const globalVendors = await prisma.serviceProvider.findMany({
          where: {
            type: 'vendor',
            isGlobal: true,
            isDeleted: false,
            isActive: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        // Combine and deduplicate
        const localProviderIds = new Set(landlordProviders.map(lp => lp.providerId));
        const allVendors = [
          ...landlordProviders.map(lp => ({
            id: lp.provider.id,
            vendorId: lp.provider.providerId,
            name: lp.provider.name,
            businessName: lp.provider.businessName,
            phone: lp.provider.phone,
            email: lp.provider.email,
            category: lp.provider.category || '',
            rating: lp.provider.rating,
            hourlyRate: lp.provider.hourlyRate,
            notes: lp.provider.notes,
            addressLine1: lp.provider.addressLine1,
            addressLine2: lp.provider.addressLine2,
            city: lp.provider.city,
            provinceState: lp.provider.provinceState,
            postalZip: lp.provider.postalZip,
            country: lp.provider.country,
            countryCode: lp.provider.countryCode,
            regionCode: lp.provider.regionCode,
            latitude: lp.provider.latitude,
            longitude: lp.provider.longitude,
            isGlobal: lp.provider.isGlobal,
            isActive: lp.provider.isActive,
            isDeleted: lp.provider.isDeleted,
            createdAt: lp.provider.createdAt,
            updatedAt: lp.provider.updatedAt,
            addedAt: lp.addedAt,
            addedBy: lp.addedBy,
          })),
          ...globalVendors.filter(v => !localProviderIds.has(v.id)).map(v => ({
            id: v.id,
            vendorId: v.providerId,
            name: v.name,
            businessName: v.businessName,
            phone: v.phone,
            email: v.email,
            category: v.category || '',
            rating: v.rating,
            hourlyRate: v.hourlyRate,
            notes: v.notes,
            addressLine1: v.addressLine1,
            addressLine2: v.addressLine2,
            city: v.city,
            provinceState: v.provinceState,
            postalZip: v.postalZip,
            country: v.country,
            countryCode: v.countryCode,
            regionCode: v.regionCode,
            latitude: v.latitude,
            longitude: v.longitude,
            isGlobal: v.isGlobal,
            isActive: v.isActive,
            isDeleted: v.isDeleted,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
            addedAt: null,
            addedBy: null,
          })),
        ];

        vendorsData = {
          vendors: allVendors.map(v => serializePrismaData(v)),
        };

        // Load PMC contractors data
        const landlordProvidersContractors = await prisma.landlordServiceProvider.findMany({
          where: {
            landlordId: { in: landlordIds },
            provider: {
              type: 'contractor',
            },
          },
          include: {
            provider: true,
          },
          orderBy: { addedAt: 'desc' },
        });

        contractorsData = {
          contractors: landlordProvidersContractors.map(lp => serializePrismaData({
            id: lp.provider.id,
            contractorId: lp.provider.providerId,
            companyName: lp.provider.name,
            contactName: lp.provider.contactName,
            licenseNumber: lp.provider.licenseNumber,
            email: lp.provider.email,
            phone: lp.provider.phone,
            specialties: lp.provider.specialties || [],
            addressLine1: lp.provider.addressLine1,
            addressLine2: lp.provider.addressLine2,
            city: lp.provider.city,
            provinceState: lp.provider.provinceState,
            postalZip: lp.provider.postalZip,
            country: lp.provider.country,
            countryCode: lp.provider.countryCode,
            regionCode: lp.provider.regionCode,
            latitude: lp.provider.latitude,
            longitude: lp.provider.longitude,
            rating: lp.provider.rating,
            hourlyRate: lp.provider.hourlyRate,
            notes: lp.provider.notes,
            isGlobal: lp.provider.isGlobal,
            isActive: lp.provider.isActive,
            isDeleted: lp.provider.isDeleted,
            createdAt: lp.provider.createdAt,
            updatedAt: lp.provider.updatedAt,
            addedAt: lp.addedAt,
            addedBy: lp.addedBy,
          })),
        };
      }
    } catch (error) {
      console.error('[Partners Page] Error loading PMC data:', error);
    }
  }

  // Serialize user data
  const serializedUser = serializePrismaData({
    ...user,
    role: userRole || 'landlord',
  });

  return (
    <main className="page">
      <PartnersClient
        user={serializedUser}
        userRole={userRole || 'landlord'}
        vendorsData={vendorsData}
        contractorsData={contractorsData}
      />
    </main>
  );
}, { role: 'both' }); // Allow landlord and PMC

