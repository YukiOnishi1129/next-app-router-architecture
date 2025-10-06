import { Repository } from '../shared/repository';
import { Attachment } from './attachment';
import { AttachmentId } from './attachment-id';
import { RequestId } from '../request';

/**
 * Attachment repository interface
 */
export interface AttachmentRepository extends Repository<Attachment, AttachmentId> {
  findByRequestId(requestId: RequestId): Promise<Attachment[]>;
  deleteByRequestId(requestId: RequestId): Promise<void>;
}