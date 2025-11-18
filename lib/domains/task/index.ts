/**
 * Task Domain Re-export
 * Re-exports from domains/task/domain
 */

export * from '@/domains/task/domain';
export { TaskService } from '@/domains/task/domain/TaskService';
export { TaskRepository } from '@/domains/task/domain/TaskRepository';

// Re-export service instance
import { TaskService } from '@/domains/task/domain/TaskService';
import { TaskRepository } from '@/domains/task/domain/TaskRepository';
import { prisma } from '@/lib/prisma';

const taskRepository = new TaskRepository(prisma);
export const taskService = new TaskService(taskRepository);

