/**
 * Expense Domain Re-export
 * Re-exports from domains/expense/domain
 */

export * from '@/domains/expense/domain';
export { ExpenseService } from '@/domains/expense/domain/ExpenseService';
export { ExpenseRepository } from '@/domains/expense/domain/ExpenseRepository';

// Re-export service instance
import { ExpenseService } from '@/domains/expense/domain/ExpenseService';
import { ExpenseRepository } from '@/domains/expense/domain/ExpenseRepository';
import { prisma } from '@/lib/prisma';

const expenseRepository = new ExpenseRepository(prisma);
export const expenseService = new ExpenseService(expenseRepository);

