import { InvitationRepository } from './InvitationRepository';
import { InvitationService } from './InvitationService';
import { prisma } from '@/lib/prisma';

const invitationRepository = new InvitationRepository(prisma);
export const invitationService = new InvitationService(invitationRepository);

