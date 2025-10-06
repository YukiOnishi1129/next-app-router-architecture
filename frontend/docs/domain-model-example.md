# Domain Model実装例

このドキュメントでは、申請管理システムを例に、external/domainでのドメインモデル実装を説明します。

## ドメインモデルの構造

```
external/domain/
├── user/
│   ├── index.ts         # Userドメインモデル
│   └── types.ts         # User関連の型定義
├── request/
│   ├── index.ts         # Requestドメインモデル
│   ├── types.ts         # Request関連の型定義
│   └── status.ts        # ステータス遷移ロジック
├── attachment/
│   ├── index.ts         # Attachmentドメインモデル
│   └── types.ts         # Attachment関連の型定義
├── comment/
│   ├── index.ts         # Commentドメインモデル
│   └── types.ts         # Comment関連の型定義
├── audit-log/
│   ├── index.ts         # AuditLogドメインモデル
│   └── types.ts         # AuditLog関連の型定義
└── shared/
    └── value-objects.ts # 共通の値オブジェクト
```

## User ドメイン

```typescript
// external/domain/user/types.ts
export type UserRole = 'requester' | 'approver' | 'admin'

export interface UserData {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// external/domain/user/index.ts
export class UserDomain {
  constructor(private data: Partial<UserData>) {}

  canApprove(): boolean {
    return this.data.role === 'approver' || this.data.role === 'admin'
  }

  canManageAllRequests(): boolean {
    return this.data.role === 'admin'
  }

  canCreateRequest(): boolean {
    return true // すべてのユーザーが申請可能
  }

  validate(): string[] {
    const errors: string[] = []
    
    if (!this.data.name || this.data.name.trim().length === 0) {
      errors.push('名前は必須です')
    }
    
    if (!this.data.email || !this.isValidEmail(this.data.email)) {
      errors.push('有効なメールアドレスを入力してください')
    }
    
    return errors
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
```

## Request ドメイン

```typescript
// external/domain/request/types.ts
export type RequestType = 'expense' | 'purchase' | 'access'
export type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface RequestData {
  id: string
  type: RequestType
  title: string
  amount?: number
  reason: string
  status: RequestStatus
  createdBy: string
  approverId?: string
  attachments: string[]
  createdAt: Date
  updatedAt: Date
}

// external/domain/request/status.ts
export class RequestStatusMachine {
  private static readonly transitions: Record<RequestStatus, RequestStatus[]> = {
    draft: ['submitted'],
    submitted: ['approved', 'rejected'],
    approved: [],
    rejected: [],
  }

  static canTransition(from: RequestStatus, to: RequestStatus): boolean {
    return this.transitions[from]?.includes(to) ?? false
  }

  static getNextStatuses(current: RequestStatus): RequestStatus[] {
    return this.transitions[current] ?? []
  }
}

// external/domain/request/index.ts
import { RequestStatusMachine } from './status'

export class RequestDomain {
  constructor(private data: Partial<RequestData>) {}

  validate(): string[] {
    const errors: string[] = []
    
    // タイトルのバリデーション
    if (!this.data.title) {
      errors.push('タイトルは必須です')
    } else if (this.data.title.length > 120) {
      errors.push('タイトルは120文字以内で入力してください')
    }
    
    // 金額のバリデーション（経費・購入申請の場合）
    if (this.requiresAmount() && (!this.data.amount || this.data.amount < 0)) {
      errors.push('金額は0以上で入力してください')
    }
    
    // 理由のバリデーション
    if (!this.data.reason) {
      errors.push('理由は必須です')
    } else if (this.data.reason.length > 2000) {
      errors.push('理由は2000文字以内で入力してください')
    }
    
    // 添付ファイルのバリデーション
    if (this.data.attachments && this.data.attachments.length > 10) {
      errors.push('添付ファイルは10個までです')
    }
    
    return errors
  }

  canSubmit(): boolean {
    return this.data.status === 'draft' && this.validate().length === 0
  }

  canApprove(): boolean {
    return this.data.status === 'submitted'
  }

  canEdit(): boolean {
    return this.data.status === 'draft'
  }

  canDelete(): boolean {
    return this.data.status === 'draft'
  }

  transitionTo(newStatus: RequestStatus): { success: boolean; error?: string } {
    if (!this.data.status) {
      return { success: false, error: 'Current status is undefined' }
    }
    
    if (!RequestStatusMachine.canTransition(this.data.status, newStatus)) {
      return { 
        success: false, 
        error: `Cannot transition from ${this.data.status} to ${newStatus}` 
      }
    }
    
    this.data.status = newStatus
    return { success: true }
  }

  private requiresAmount(): boolean {
    return this.data.type === 'expense' || this.data.type === 'purchase'
  }

  toEntity() {
    return {
      ...this.data,
      title: this.data.title?.trim(),
      reason: this.data.reason?.trim(),
      updatedAt: new Date(),
    }
  }
}
```

## Attachment ドメイン

```typescript
// external/domain/attachment/types.ts
export interface AttachmentData {
  id: string
  requestId: string
  url: string
  filename: string
  fileSize?: number
  mimeType?: string
  createdAt: Date
}

// external/domain/attachment/index.ts
export class AttachmentDomain {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]

  constructor(private data: Partial<AttachmentData>) {}

  validate(): string[] {
    const errors: string[] = []
    
    if (!this.data.filename) {
      errors.push('ファイル名は必須です')
    }
    
    if (!this.data.url) {
      errors.push('ファイルURLは必須です')
    }
    
    if (this.data.fileSize && this.data.fileSize > AttachmentDomain.MAX_FILE_SIZE) {
      errors.push('ファイルサイズは10MB以下にしてください')
    }
    
    if (this.data.mimeType && !AttachmentDomain.ALLOWED_MIME_TYPES.includes(this.data.mimeType)) {
      errors.push('許可されていないファイル形式です')
    }
    
    return errors
  }

  isImage(): boolean {
    return this.data.mimeType?.startsWith('image/') ?? false
  }

  getFileExtension(): string {
    return this.data.filename?.split('.').pop()?.toLowerCase() ?? ''
  }

  toEntity() {
    return {
      ...this.data,
      createdAt: new Date(),
    }
  }
}
```

## Comment ドメイン

```typescript
// external/domain/comment/types.ts
export interface CommentData {
  id: string
  requestId: string
  userId: string
  body: string
  createdAt: Date
}

// external/domain/comment/index.ts
export class CommentDomain {
  constructor(private data: Partial<CommentData>) {}

  validate(): string[] {
    const errors: string[] = []
    
    if (!this.data.body || this.data.body.trim().length === 0) {
      errors.push('コメント内容を入力してください')
    }
    
    if (this.data.body && this.data.body.length > 1000) {
      errors.push('コメントは1000文字以内で入力してください')
    }
    
    return errors
  }

  isSystemComment(): boolean {
    // システムが自動生成したコメントかどうか
    return this.data.body?.startsWith('[System]') ?? false
  }

  toEntity() {
    return {
      ...this.data,
      body: this.data.body?.trim(),
      createdAt: new Date(),
    }
  }
}
```

## AuditLog ドメイン

```typescript
// external/domain/audit-log/types.ts
export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'submit' 
  | 'approve' 
  | 'reject'
  | 'comment'
  | 'attach'
  | 'detach'

export type TargetType = 'request' | 'user' | 'attachment' | 'comment'

export interface AuditLogData {
  id: string
  actorId: string
  targetType: TargetType
  targetId: string
  action: AuditAction
  payload?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// external/domain/audit-log/index.ts
export class AuditLogDomain {
  constructor(private data: Partial<AuditLogData>) {}

  validate(): string[] {
    const errors: string[] = []
    
    if (!this.data.actorId) {
      errors.push('実行者IDは必須です')
    }
    
    if (!this.data.targetType) {
      errors.push('対象タイプは必須です')
    }
    
    if (!this.data.targetId) {
      errors.push('対象IDは必須です')
    }
    
    if (!this.data.action) {
      errors.push('アクションは必須です')
    }
    
    return errors
  }

  isHighRiskAction(): boolean {
    const highRiskActions: AuditAction[] = ['delete', 'approve', 'reject']
    return highRiskActions.includes(this.data.action!)
  }

  getDescription(): string {
    const actionDescriptions: Record<AuditAction, string> = {
      create: '作成',
      update: '更新',
      delete: '削除',
      submit: '提出',
      approve: '承認',
      reject: '却下',
      comment: 'コメント追加',
      attach: 'ファイル添付',
      detach: 'ファイル削除',
    }
    
    return actionDescriptions[this.data.action!] || this.data.action!
  }

  toEntity() {
    return {
      ...this.data,
      createdAt: new Date(),
    }
  }
}
```

## 共通の値オブジェクト

```typescript
// external/domain/shared/value-objects.ts
export class Money {
  constructor(private amount: number, private currency: string = 'JPY') {}

  validate(): string[] {
    const errors: string[] = []
    
    if (this.amount < 0) {
      errors.push('金額は0以上である必要があります')
    }
    
    if (!['JPY', 'USD', 'EUR'].includes(this.currency)) {
      errors.push('サポートされていない通貨です')
    }
    
    return errors
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('異なる通貨の計算はできません')
    }
    return new Money(this.amount + other.amount, this.currency)
  }

  format(): string {
    const formatter = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: this.currency,
    })
    return formatter.format(this.amount)
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    }
  }
}

export class DateRange {
  constructor(
    private startDate: Date,
    private endDate: Date
  ) {}

  validate(): string[] {
    const errors: string[] = []
    
    if (this.startDate > this.endDate) {
      errors.push('開始日は終了日より前である必要があります')
    }
    
    return errors
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate
  }

  getDays(): number {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}
```

## Service層での使用例

```typescript
// external/service/request/index.ts
import 'server-only'
import { RequestDomain } from '@/external/domain/request'
import { UserDomain } from '@/external/domain/user'
import { requestRepository } from '@/external/client/db/repository/request'
import { auditService } from '@/external/service/audit'
import { notificationService } from '@/external/service/notification'

export const requestService = {
  async createRequest(data: CreateRequestData, userId: string) {
    const requestDomain = new RequestDomain({
      ...data,
      status: 'draft',
      createdBy: userId,
      attachments: data.attachments || [],
    })

    const errors = requestDomain.validate()
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    const request = await requestRepository.create(requestDomain.toEntity())
    
    // 監査ログ記録
    await auditService.log({
      actorId: userId,
      targetType: 'request',
      targetId: request.id,
      action: 'create',
      payload: { type: request.type, title: request.title },
    })

    return request
  },

  async submitRequest(requestId: string, userId: string) {
    const request = await requestRepository.findById(requestId)
    if (!request) throw new Error('申請が見つかりません')
    
    if (request.createdBy !== userId) {
      throw new Error('この申請を編集する権限がありません')
    }

    const requestDomain = new RequestDomain(request)
    const transition = requestDomain.transitionTo('submitted')
    
    if (!transition.success) {
      throw new Error(transition.error)
    }

    const updated = await requestRepository.update(
      requestId,
      { status: 'submitted' }
    )

    // 承認者に通知
    await notificationService.notifyApprovers(updated)
    
    // 監査ログ
    await auditService.log({
      actorId: userId,
      targetType: 'request',
      targetId: requestId,
      action: 'submit',
    })

    return updated
  },

  async approveRequest(
    requestId: string, 
    approverId: string, 
    comment?: string
  ) {
    const request = await requestRepository.findById(requestId)
    if (!request) throw new Error('申請が見つかりません')

    const approver = await userRepository.findById(approverId)
    const approverDomain = new UserDomain(approver)
    
    if (!approverDomain.canApprove()) {
      throw new Error('承認する権限がありません')
    }

    const requestDomain = new RequestDomain(request)
    const transition = requestDomain.transitionTo('approved')
    
    if (!transition.success) {
      throw new Error(transition.error)
    }

    const updated = await requestRepository.update(
      requestId,
      { 
        status: 'approved',
        approverId,
      }
    )

    // コメントがあれば追加
    if (comment) {
      await commentService.addComment({
        requestId,
        userId: approverId,
        body: comment,
      })
    }

    // 申請者に通知
    await notificationService.notifyRequestApproved(updated)
    
    // 監査ログ
    await auditService.log({
      actorId: approverId,
      targetType: 'request',
      targetId: requestId,
      action: 'approve',
      payload: { comment },
    })

    return updated
  },
}
```

## Handler層での使用例

```typescript
// external/handler/request/create.ts
'use server'

import { createRequestSchema } from '@/features/requests/schemas'
import { requestService } from '@/external/service/request'
import { requireAuth } from '@/external/service/auth'
import { revalidatePath } from 'next/cache'

export async function createRequestAction(input: unknown) {
  const session = await requireAuth()
  
  const validated = createRequestSchema.safeParse(input)
  
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    const request = await requestService.createRequest(
      validated.data,
      session.userId
    )
    
    revalidatePath('/requests')
    return { success: true, data: request }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '申請の作成に失敗しました'
    }
  }
}
```

## まとめ

ドメインモデルを使用することで：

1. **ビジネスルールの集約**: ステータス遷移、権限チェック、バリデーションをドメイン層に集約
2. **テスタビリティ**: ドメインロジックを独立してテスト可能
3. **保守性**: ビジネスルールの変更が一箇所に集中
4. **型安全性**: TypeScriptの型システムを最大限活用