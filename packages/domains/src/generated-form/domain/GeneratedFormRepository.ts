import { prisma } from '@/lib/prisma';
// import { GeneratedFormQuery, GeneratedFormCreate, GeneratedFormUpdate } from '@/lib/schemas/domains/generated-form.schema';
// TODO: Use types from schema registry
type GeneratedFormQuery = any;
type GeneratedFormCreate = any;
type GeneratedFormUpdate = any;
import { Prisma } from '@prisma/client';

export class GeneratedFormRepository {
  constructor(private prisma: any) {} // Using any to avoid circular type reference

  async findMany(query: GeneratedFormQuery, user: any) {
    const { page = 1, limit = 50, formType, status, tenantId, propertyId, startDate, endDate } = query;
    const offset = (page - 1) * limit;

    // Build where clause
    let where: Prisma.GeneratedFormWhereInput = {};

    if (user.role === 'landlord') {
      where.generatedBy = user.userId;
    } else if (user.role === 'pmc') {
      // Get managed landlord IDs
      const pmcRelationships = await this.prisma.pMCLandlord.findMany({
        where: {
          pmcId: user.userId,
          status: 'active',
          OR: [{ endedAt: null }, { endedAt: { gt: new Date() } }],
        },
        select: { landlordId: true },
      });

      const managedLandlordIds = pmcRelationships.map(rel => rel.landlordId);
      if (managedLandlordIds.length === 0) {
        return { forms: [], total: 0 };
      }

      // Get managed property IDs
      const managedProperties = await this.prisma.property.findMany({
        where: { landlordId: { in: managedLandlordIds } },
        select: { id: true },
      });
      const managedPropertyIds = managedProperties.map(p => p.id);

      where.OR = [
        { generatedBy: { in: managedLandlordIds } },
        { propertyId: { in: managedPropertyIds } },
      ];
    } else {
      throw new Error('Forbidden: User role not allowed to view generated forms');
    }

    if (formType) where.formType = formType;
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;
    if (propertyId) where.propertyId = propertyId;
    if (startDate) {
      where.generatedAt = { gte: new Date(startDate) };
    }
    if (endDate) {
      if (where.generatedAt && typeof where.generatedAt === 'object' && 'gte' in where.generatedAt) {
        where.generatedAt = { ...(where.generatedAt as any), lte: new Date(endDate) };
      } else {
        where.generatedAt = { lte: new Date(endDate) };
      }
    }

    const [forms, total] = await Promise.all([
      this.prisma.generatedForm.findMany({
        where,
        orderBy: { generatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.generatedForm.count({ where }),
    ]);

    // Enrich with tenant/property names
    const tenantIds = [...new Set(forms.filter(f => f.tenantId).map(f => f.tenantId!))];
    const propertyIds = [...new Set(forms.filter(f => f.propertyId).map(f => f.propertyId!))];
    const unitIds = [...new Set(forms.filter(f => f.unitId).map(f => f.unitId!))];

    const [tenants, properties, units] = await Promise.all([
      tenantIds.length > 0
        ? this.prisma.tenant.findMany({
            where: { id: { in: tenantIds } },
            select: { id: true, firstName: true, lastName: true, email: true },
          })
        : [],
      propertyIds.length > 0
        ? this.prisma.property.findMany({
            where: { id: { in: propertyIds } },
            select: {
              id: true,
              propertyName: true,
              addressLine1: true,
              provinceState: true,
              unitCount: true,
            },
          })
        : [],
      unitIds.length > 0
        ? this.prisma.unit.findMany({
            where: { id: { in: unitIds } },
            select: { id: true, unitName: true },
          })
        : [],
    ]);

    const tenantMap = new Map(tenants.map(t => [t.id, t]));
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    const unitMap = new Map(units.map(u => [u.id, u]));

    const enrichedForms = forms.map((form) => {
      const enriched: any = { ...form };

      if (form.tenantId) {
        const tenant = tenantMap.get(form.tenantId);
        if (tenant) {
          enriched.tenantName = `${(tenant as any).firstName || ''} ${(tenant as any).lastName || ''}`.trim();
          enriched.tenantEmail = (tenant as any).email || '';
        }
      }

      if (form.propertyId) {
        const property = propertyMap.get(form.propertyId);
        if (property) {
          enriched.propertyAddress = (property as any).addressLine1 || '';
          enriched.propertyName = (property as any).propertyName || '';
          enriched.propertyCity = (property as any).provinceState || '';
          enriched.propertyUnitCount = (property as any).unitCount || 0;
        }
      }

      if (form.unitId) {
        const unit = unitMap.get(form.unitId);
        if (unit) {
          enriched.unitName = (unit as any).unitName || '';
        }
      }

      return enriched;
    });

    return { forms: enrichedForms, total };
  }

  async findUnique(id: string, user: any) {
    const form = await this.prisma.generatedForm.findUnique({
      where: { id },
    });

    if (!form) return null;

    // RBAC check
    if (user.role === 'landlord' && form.generatedBy !== user.userId) return null;
    if (user.role === 'pmc') {
      const pmcRelationship = await this.prisma.pMCLandlord.findFirst({
        where: {
          pmcId: user.userId,
          landlordId: form.generatedBy,
          status: 'active',
        },
      });
      if (!pmcRelationship) return null;
    }

    return form;
  }

  async create(data: GeneratedFormCreate, user: any) {
    return this.prisma.generatedForm.create({
      data: {
        ...data,
        generatedBy: user.userId,
      },
    });
  }

  async update(id: string, data: GeneratedFormUpdate) {
    return this.prisma.generatedForm.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.generatedForm.delete({ where: { id } });
  }
}

