import { GeneratedFormRepository } from './GeneratedFormRepository';
import { GeneratedFormCreate, GeneratedFormUpdate, GeneratedFormQuery } from '@/lib/schemas';
import { formGenerateSchema, FormGenerate } from '@/lib/schemas';
import { UserContext } from '@/lib/middleware/apiMiddleware';
import { hasPermission } from '@/lib/rbac';
import { ResourceCategory, PermissionAction } from '@prisma/client';
import { logCreate, logUpdate, logDelete } from '@/lib/utils/activity-logger';
import { populateFormData } from '@/lib/utils/form-data-populator';
import { generateCUID } from '@/lib/utils/id-generator';
import { TenantRepository } from '@domains/tenant/domain/TenantRepository';
import { LeaseRepository } from '@domains/lease/domain/LeaseRepository';
import { PropertyRepository } from '@domains/property/domain/PropertyRepository';
import { UnitRepository } from '@domains/unit/domain/UnitRepository';

export class GeneratedFormService {
  constructor(
    private repository: GeneratedFormRepository,
    private tenantRepository?: TenantRepository,
    private leaseRepository?: LeaseRepository,
    private propertyRepository?: PropertyRepository,
    private unitRepository?: UnitRepository
  ) {}

  async getGeneratedForms(query: GeneratedFormQuery, user: UserContext) {
    return this.repository.findMany(query, user);
  }

  async getGeneratedFormById(id: string, user: UserContext) {
    return this.repository.findUnique(id, user);
  }

  async createGeneratedForm(data: GeneratedFormCreate, user: UserContext) {
    // RBAC: Check permission
    const canCreate = await hasPermission(
      user.userId,
      user.role,
      'forms',
      PermissionAction.CREATE,
      ResourceCategory.DOCUMENT_MANAGEMENT
    );
    if (!canCreate) {
      throw new Error('Forbidden: You do not have permission to create forms');
    }

    const newForm = await this.repository.create(data, user);

    await logCreate(
      user,
      'generatedForm',
      newForm.id,
      `${newForm.formType} form`,
      `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'System' + ` created ${newForm.formType} form`
    );

    return newForm;
  }

  async updateGeneratedForm(id: string, data: GeneratedFormUpdate, user: UserContext) {
    const existingForm = await this.repository.findUnique(id, user);
    if (!existingForm) {
      throw new Error('Generated form not found or forbidden');
    }

    // RBAC: Check permission
    const canUpdate = await hasPermission(
      user.userId,
      user.role,
      'forms',
      PermissionAction.UPDATE,
      ResourceCategory.DOCUMENT_MANAGEMENT,
      { formId: id } as any
    );
    if (!canUpdate) {
      throw new Error('Forbidden: You do not have permission to update forms');
    }

    const updatedForm = await this.repository.update(id, data);

    await logUpdate(
      user,
      'generatedForm',
      updatedForm.id,
      `${updatedForm.formType} form`,
      `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'System' + ` updated ${updatedForm.formType} form`
    );

    return updatedForm;
  }

  async deleteGeneratedForm(id: string, user: UserContext) {
    const existingForm = await this.repository.findUnique(id, user);
    if (!existingForm) {
      throw new Error('Generated form not found or forbidden');
    }

    // RBAC: Check permission
    const canDelete = await hasPermission(
      user.userId,
      user.role,
      'forms',
      PermissionAction.DELETE,
      ResourceCategory.DOCUMENT_MANAGEMENT,
      { formId: id } as any
    );
    if (!canDelete) {
      throw new Error('Forbidden: You do not have permission to delete forms');
    }

    await logDelete(
      user,
      'generatedForm',
      existingForm.id,
      `${existingForm.formType} form`,
      `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'System' + ` deleted ${existingForm.formType} form`
    );

    return this.repository.delete(id);
  }

  /**
   * Generate a form with populated data
   * Domain-Driven implementation - uses repositories instead of direct Prisma
   */
  async generateForm(data: FormGenerate, user: UserContext) {
    // Only landlords can generate forms
    if (user.role !== 'landlord') {
      throw new Error('Only landlords can generate forms');
    }

    // Fetch related entities using repositories
    let tenant: any = null;
    let lease: any = null;
    let property: any = null;
    let unit: any = null;

    if (data.tenantId && this.tenantRepository) {
      tenant = await this.tenantRepository.findById(data.tenantId);
    }

    if (data.leaseId && this.leaseRepository) {
      lease = await this.leaseRepository.findById(data.leaseId);
    }

    if (data.propertyId && this.propertyRepository) {
      property = await this.propertyRepository.findById(data.propertyId);
    }

    if (data.unitId && this.unitRepository) {
      unit = await this.unitRepository.findById(data.unitId);
    }

    // Populate form data
    const formData = await populateFormData(data.formType, {
      tenant,
      lease,
      property,
      unit,
      customData: data.customData,
      user,
    });

    // Create generated form record
    const formId = generateCUID();
    const generatedForm = await this.repository.create(
      {
        id: formId,
        formType: data.formType,
        tenantId: tenant?.id || null,
        leaseId: lease?.id || null,
        propertyId: property?.id || null,
        unitId: unit?.id || null,
        generatedBy: user.userId,
        formData: formData as any,
        status: 'draft',
        updatedAt: new Date(),
      } as any,
      user
    );

    return generatedForm;
  }
}

