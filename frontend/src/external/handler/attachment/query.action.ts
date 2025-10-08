'use server'

import {
  getAttachmentContentServer,
  listAttachmentsServer,
} from './query.server'

import type {
  GetAttachmentContentResponse,
  ListAttachmentsInput,
  ListAttachmentsResponse,
} from './query.server'

export async function listAttachmentsAction(
  data: ListAttachmentsInput
): Promise<ListAttachmentsResponse> {
  return listAttachmentsServer(data)
}

export async function getAttachmentContentAction(
  attachmentId: string
): Promise<GetAttachmentContentResponse> {
  return getAttachmentContentServer(attachmentId)
}

export type {
  ListAttachmentsInput,
  ListAttachmentsResponse,
  GetAttachmentContentResponse,
} from './query.server'
