/**
 * Maintenance Request Service
 * 
 * Domain logic for Maintenance Request domain
 */

import { MaintenanceRepository } from './MaintenanceRepository';
import { MaintenanceRequestCreate, MaintenanceRequestUpdate, MaintenanceRequestQuery } from '@/lib/schemas';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';
import { generateMaintenanceHash } from '@/lib/hooks/useHashGenerator';

export class MaintenanceService {
  constructor(private repository: MaintenanceRepository) {}

  /**
   * Create a new maintenance request with business logic
   */
  async create(data: MaintenanceRequestCreate, context: { userId: string; userRole: string }) {
    // Generate ticket number
    const ticketNumber = generateMaintenanceHash({
      propertyId: data.propertyId || '',
      tenantId: data.tenantId,
      requestedDate: data.requestedDate || new Date().toISOString().split('T')[0],
    } as any);

    // Parse dates
    const requestedDate = data.requestedDate 
      ? createDateAtLocalMidnight(data.requestedDate)
      : new Date();
    
    const scheduledDate = data.scheduledDate 
      ? createDateAtLocalMidnight(data.scheduledDate)
      : null;

    // Create request
    const request = await this.repository.create({
      ...data,
      requestedDate: requestedDate.toISOString().split('T')[0],
      scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : undefined,
      ticketNumber,
    });

    return request;
  }

  /**
   * Update a maintenance request with business logic
   */
  async update(id: string, data: MaintenanceRequestUpdate) {
    // Parse dates if provided
    if (data.scheduledDate) {
      const parsed = createDateAtLocalMidnight(data.scheduledDate);
      data.scheduledDate = parsed.toISOString().split('T')[0] as any;
    }

    if (data.completedDate) {
      const parsed = createDateAtLocalMidnight(data.completedDate);
      data.completedDate = parsed.toISOString().split('T')[0] as any;
    }

    return this.repository.update(id, data);
  }

  /**
   * Get maintenance requests with pagination
   */
  async list(query: MaintenanceRequestQuery & { where?: any }, include?: { tenant?: boolean; property?: boolean; comments?: boolean; assignedToProvider?: boolean }) {
    return this.repository.findMany(query, include);
  }

  /**
   * Get maintenance request by ID
   */
  async getById(id: string, include?: { tenant?: boolean; property?: boolean; comments?: boolean; assignedToProvider?: boolean }) {
    return this.repository.findById(id, include);
  }

  /**
   * Delete a maintenance request
   */
  async delete(id: string) {
    return this.repository.delete(id);
  }
}

