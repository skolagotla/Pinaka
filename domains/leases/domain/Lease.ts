/**
 * Lease Domain Entity
 * 
 * Pure domain model - no infrastructure dependencies
 * Contains business logic and domain rules
 */

export interface LeaseEntity {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  status: 'active' | 'expired' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lease Aggregate Root
 * 
 * Encapsulates business logic for lease operations
 */
export class Lease {
  constructor(private data: LeaseEntity) {}

  get id(): string {
    return this.data.id;
  }

  get propertyId(): string {
    return this.data.propertyId;
  }

  get tenantId(): string {
    return this.data.tenantId;
  }

  get startDate(): Date {
    return this.data.startDate;
  }

  get endDate(): Date {
    return this.data.endDate;
  }

  get monthlyRent(): number {
    return this.data.monthlyRent;
  }

  get status(): 'active' | 'expired' | 'terminated' {
    return this.data.status;
  }

  /**
   * Domain logic: Check if lease is active
   */
  isActive(): boolean {
    const now = new Date();
    return (
      this.data.status === 'active' &&
      this.data.startDate <= now &&
      this.data.endDate >= now
    );
  }

  /**
   * Domain logic: Check if lease is expired
   */
  isExpired(): boolean {
    const now = new Date();
    return this.data.endDate < now && this.data.status === 'active';
  }

  /**
   * Domain logic: Calculate remaining days
   */
  getRemainingDays(): number {
    const now = new Date();
    if (this.data.endDate < now) {
      return 0;
    }
    const diffTime = this.data.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Domain logic: Calculate total rent for lease period
   */
  calculateTotalRent(): number {
    const start = this.data.startDate;
    const end = this.data.endDate;
    const months = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return months * this.data.monthlyRent;
  }

  /**
   * Domain logic: Terminate lease
   */
  terminate(terminationDate: Date): void {
    if (terminationDate < this.data.startDate) {
      throw new Error('Termination date cannot be before lease start date');
    }
    if (terminationDate > this.data.endDate) {
      throw new Error('Termination date cannot be after lease end date');
    }
    this.data.status = 'terminated';
    this.data.endDate = terminationDate;
    this.data.updatedAt = new Date();
  }

  /**
   * Domain logic: Renew lease
   */
  renew(newEndDate: Date): void {
    if (newEndDate <= this.data.endDate) {
      throw new Error('New end date must be after current end date');
    }
    this.data.endDate = newEndDate;
    this.data.updatedAt = new Date();
  }

  /**
   * Convert to plain object
   */
  toJSON(): LeaseEntity {
    return { ...this.data };
  }
}

/**
 * Domain Exceptions
 */
export class LeaseDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeaseDomainException';
  }
}

export class InvalidLeaseDateException extends LeaseDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLeaseDateException';
  }
}

