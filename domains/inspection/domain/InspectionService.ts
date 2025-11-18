/**
 * Inspection Service
 * 
 * Domain logic for Inspection domain
 */

import { InspectionRepository } from './InspectionRepository';
import { InspectionChecklistCreate, InspectionChecklistUpdate, InspectionChecklistQuery } from '@/lib/schemas';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';

export class InspectionService {
  constructor(private repository: InspectionRepository) {}

  async create(data: InspectionChecklistCreate, context: { userId: string; userRole: string }) {
    // Parse inspection date if provided
    const inspectionDate = data.inspectionDate 
      ? createDateAtLocalMidnight(data.inspectionDate)
      : null;

    // Create checklist
    const checklist = await this.repository.create({
      ...data,
      inspectionDate: inspectionDate ? inspectionDate.toISOString().split('T')[0] : undefined,
    });

    return checklist;
  }

  async update(id: string, data: InspectionChecklistUpdate) {
    // Parse dates if provided
    if (data.inspectionDate) {
      const parsed = createDateAtLocalMidnight(data.inspectionDate);
      data.inspectionDate = parsed.toISOString().split('T')[0] as any;
    }

    if (data.submittedAt) {
      const parsed = createDateAtLocalMidnight(data.submittedAt);
      data.submittedAt = parsed.toISOString().split('T')[0] as any;
    }

    if (data.approvedAt) {
      const parsed = createDateAtLocalMidnight(data.approvedAt);
      data.approvedAt = parsed.toISOString().split('T')[0] as any;
    }

    if (data.rejectedAt) {
      const parsed = createDateAtLocalMidnight(data.rejectedAt);
      data.rejectedAt = parsed.toISOString().split('T')[0] as any;
    }

    return this.repository.update(id, data);
  }

  async list(query: InspectionChecklistQuery & { where?: any }, include?: { tenant?: boolean; items?: boolean }) {
    return this.repository.findMany(query, include);
  }

  async getById(id: string, include?: { tenant?: boolean; items?: boolean }) {
    return this.repository.findById(id, include);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}

