# DDD ドメイン分析 - 申請管理システム

## 1. エンティティ（Entity）

エンティティは一意の識別子を持ち、ライフサイクルを通じて同一性を保つオブジェクトです。

### 1.1 User エンティティ
```typescript
// external/domain/user/entity.ts
export class User {
  constructor(
    private readonly id: string,
    private name: string,
    private email: string,
    private role: UserRole,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  // 識別子による同一性判定
  equals(other: User): boolean {
    return this.id === other.id
  }

  // ビジネスロジック
  canApproveRequest(): boolean {
    return this.role === 'approver' || this.role === 'admin'
  }

  canManageUsers(): boolean {
    return this.role === 'admin'
  }

  changeRole(newRole: UserRole): void {
    if (this.role === 'admin' && newRole !== 'admin') {
      throw new Error('管理者の権限を降格することはできません')
    }
    this.role = newRole
    this.updatedAt = new Date()
  }
}
```

### 1.2 Request エンティティ（集約ルート）
```typescript
// external/domain/request/entity.ts
export class Request {
  private attachments: Attachment[] = []
  private comments: Comment[] = []
  
  constructor(
    private readonly id: string,
    private title: string,
    private type: RequestType,
    private amount: Money | null,
    private reason: string,
    private status: RequestStatus,
    private readonly createdBy: UserId,
    private approverId: UserId | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  // 集約内のエンティティ管理
  addAttachment(attachment: Attachment): void {
    if (this.attachments.length >= 10) {
      throw new Error('添付ファイルは10個までです')
    }
    if (this.status !== 'draft') {
      throw new Error('下書き状態でのみファイルを添付できます')
    }
    this.attachments.push(attachment)
    this.updatedAt = new Date()
  }

  removeAttachment(attachmentId: string): void {
    if (this.status !== 'draft') {
      throw new Error('下書き状態でのみファイルを削除できます')
    }
    this.attachments = this.attachments.filter(a => a.getId() !== attachmentId)
    this.updatedAt = new Date()
  }

  addComment(comment: Comment): void {
    this.comments.push(comment)
    this.updatedAt = new Date()
  }

  // ステータス遷移
  submit(): void {
    if (this.status !== 'draft') {
      throw new Error('下書き状態からのみ提出できます')
    }
    this.validateForSubmission()
    this.status = 'submitted'
    this.updatedAt = new Date()
  }

  approve(approverId: UserId, comment?: string): ApprovalResult {
    if (this.status !== 'submitted') {
      throw new Error('提出済みの申請のみ承認できます')
    }
    this.status = 'approved'
    this.approverId = approverId
    this.updatedAt = new Date()

    const events: DomainEvent[] = [
      new RequestApprovedEvent(this.id, approverId, new Date())
    ]

    if (comment) {
      const approvalComment = Comment.createSystemComment(
        this.id,
        approverId.getValue(),
        `承認しました: ${comment}`
      )
      this.addComment(approvalComment)
    }

    return { events }
  }

  reject(approverId: UserId, reason: string): RejectionResult {
    if (this.status !== 'submitted') {
      throw new Error('提出済みの申請のみ却下できます')
    }
    if (!reason) {
      throw new Error('却下理由は必須です')
    }
    
    this.status = 'rejected'
    this.approverId = approverId
    this.updatedAt = new Date()

    const rejectionComment = Comment.createSystemComment(
      this.id,
      approverId.getValue(),
      `却下しました: ${reason}`
    )
    this.addComment(rejectionComment)

    return { 
      events: [new RequestRejectedEvent(this.id, approverId, reason, new Date())]
    }
  }

  private validateForSubmission(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('タイトルは必須です')
    }
    if (this.requiresAmount() && !this.amount) {
      throw new Error('金額は必須です')
    }
    if (!this.reason || this.reason.trim().length === 0) {
      throw new Error('理由は必須です')
    }
  }

  private requiresAmount(): boolean {
    return this.type === 'expense' || this.type === 'purchase'
  }
}
```

### 1.3 Attachment エンティティ
```typescript
// external/domain/attachment/entity.ts
export class Attachment {
  constructor(
    private readonly id: string,
    private readonly requestId: string,
    private readonly file: UploadedFile,
    private readonly uploadedBy: UserId,
    private readonly createdAt: Date
  ) {}

  getId(): string {
    return this.id
  }

  canBeAccessedBy(userId: UserId): boolean {
    // アクセス権限のロジック
    return true
  }
}
```

### 1.4 Comment エンティティ
```typescript
// external/domain/comment/entity.ts
export class Comment {
  constructor(
    private readonly id: string,
    private readonly requestId: string,
    private readonly userId: string,
    private readonly body: string,
    private readonly isSystem: boolean,
    private readonly createdAt: Date
  ) {}

  static createUserComment(
    requestId: string,
    userId: string,
    body: string
  ): Comment {
    const id = generateId()
    return new Comment(id, requestId, userId, body, false, new Date())
  }

  static createSystemComment(
    requestId: string,
    userId: string,
    body: string
  ): Comment {
    const id = generateId()
    return new Comment(id, requestId, userId, `[System] ${body}`, true, new Date())
  }
}
```

## 2. 値オブジェクト（Value Object）

値オブジェクトは不変で、属性によって識別されるオブジェクトです。

### 2.1 基本的な値オブジェクト
```typescript
// external/domain/shared/value-objects/user-id.ts
export class UserId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('UserIdは必須です')
    }
  }

  getValue(): string {
    return this.value
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }
}

// external/domain/shared/value-objects/email.ts
export class Email {
  private readonly value: string

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('無効なメールアドレスです')
    }
    this.value = value.toLowerCase()
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  getValue(): string {
    return this.value
  }

  getDomain(): string {
    return this.value.split('@')[1]
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}

// external/domain/shared/value-objects/money.ts
export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: Currency = Currency.JPY
  ) {
    if (amount < 0) {
      throw new Error('金額は0以上である必要があります')
    }
    if (!Number.isFinite(amount)) {
      throw new Error('金額は有効な数値である必要があります')
    }
  }

  add(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error('異なる通貨の計算はできません')
    }
    return new Money(this.amount + other.amount, this.currency)
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency)
  }

  isGreaterThan(other: Money): boolean {
    if (!this.currency.equals(other.currency)) {
      throw new Error('異なる通貨の比較はできません')
    }
    return this.amount > other.amount
  }

  format(): string {
    return this.currency.format(this.amount)
  }
}

// external/domain/shared/value-objects/currency.ts
export class Currency {
  static readonly JPY = new Currency('JPY', '¥', 0)
  static readonly USD = new Currency('USD', '$', 2)
  static readonly EUR = new Currency('EUR', '€', 2)

  private constructor(
    private readonly code: string,
    private readonly symbol: string,
    private readonly decimalPlaces: number
  ) {}

  format(amount: number): string {
    const formatter = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: this.code,
      minimumFractionDigits: this.decimalPlaces,
      maximumFractionDigits: this.decimalPlaces,
    })
    return formatter.format(amount)
  }

  equals(other: Currency): boolean {
    return this.code === other.code
  }
}
```

### 2.2 ドメイン固有の値オブジェクト
```typescript
// external/domain/request/value-objects/request-title.ts
export class RequestTitle {
  private readonly value: string

  constructor(value: string) {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      throw new Error('タイトルは必須です')
    }
    if (trimmed.length > 120) {
      throw new Error('タイトルは120文字以内で入力してください')
    }
    this.value = trimmed
  }

  getValue(): string {
    return this.value
  }

  contains(keyword: string): boolean {
    return this.value.toLowerCase().includes(keyword.toLowerCase())
  }
}

// external/domain/request/value-objects/request-reason.ts
export class RequestReason {
  private readonly value: string

  constructor(value: string) {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      throw new Error('理由は必須です')
    }
    if (trimmed.length > 2000) {
      throw new Error('理由は2000文字以内で入力してください')
    }
    this.value = trimmed
  }

  getValue(): string {
    return this.value
  }

  getSummary(maxLength: number = 100): string {
    if (this.value.length <= maxLength) {
      return this.value
    }
    return this.value.substring(0, maxLength - 3) + '...'
  }
}

// external/domain/attachment/value-objects/uploaded-file.ts
export class UploadedFile {
  constructor(
    private readonly url: string,
    private readonly filename: string,
    private readonly fileSize: number,
    private readonly mimeType: string
  ) {
    this.validate()
  }

  private validate(): void {
    if (!this.url) throw new Error('URLは必須です')
    if (!this.filename) throw new Error('ファイル名は必須です')
    if (this.fileSize > 10 * 1024 * 1024) {
      throw new Error('ファイルサイズは10MB以下にしてください')
    }
  }

  isImage(): boolean {
    return this.mimeType.startsWith('image/')
  }

  isPdf(): boolean {
    return this.mimeType === 'application/pdf'
  }

  getExtension(): string {
    return this.filename.split('.').pop()?.toLowerCase() || ''
  }
}
```

## 3. 集約（Aggregate）

集約は関連するオブジェクトのまとまりで、一貫性の境界を定義します。

### 3.1 Request 集約
```typescript
// external/domain/request/aggregate.ts
export class RequestAggregate {
  private readonly root: Request
  private readonly attachments: Attachment[]
  private readonly comments: Comment[]

  constructor(request: Request) {
    this.root = request
    this.attachments = []
    this.comments = []
  }

  // 集約の境界内でのみ操作を許可
  addAttachment(file: UploadedFile, uploadedBy: UserId): void {
    const attachment = new Attachment(
      generateId(),
      this.root.getId(),
      file,
      uploadedBy,
      new Date()
    )
    this.root.addAttachment(attachment)
  }

  submit(): DomainEvent[] {
    this.root.submit()
    return [
      new RequestSubmittedEvent(
        this.root.getId(),
        this.root.getCreatedBy(),
        new Date()
      )
    ]
  }

  approve(approverId: UserId, comment?: string): DomainEvent[] {
    const result = this.root.approve(approverId, comment)
    return result.events
  }
}
```

### 3.2 User 集約
```typescript
// external/domain/user/aggregate.ts
export class UserAggregate {
  constructor(private readonly root: User) {}

  changeRole(
    newRole: UserRole,
    changedBy: UserId
  ): DomainEvent[] {
    const oldRole = this.root.getRole()
    this.root.changeRole(newRole)
    
    return [
      new UserRoleChangedEvent(
        this.root.getId(),
        oldRole,
        newRole,
        changedBy,
        new Date()
      )
    ]
  }

  updateProfile(name: string, email: Email): void {
    this.root.updateProfile(name, email)
  }
}
```

## 4. ドメインサービス

複数の集約にまたがる処理や、特定のエンティティに属さないビジネスロジックを実装します。

### 4.1 申請承認サービス
```typescript
// external/domain/services/request-approval-service.ts
export class RequestApprovalService {
  async approveRequest(
    request: RequestAggregate,
    approver: User,
    comment?: string
  ): Promise<ApprovalResult> {
    // 承認者の権限チェック
    if (!approver.canApproveRequest()) {
      throw new Error('承認権限がありません')
    }

    // 利益相反チェック（申請者と承認者が同一でないか）
    if (request.getCreatedBy().equals(new UserId(approver.getId()))) {
      throw new Error('自分の申請を承認することはできません')
    }

    // 金額による承認権限チェック
    const amount = request.getAmount()
    if (amount && this.exceedsApprovalLimit(amount, approver)) {
      throw new Error('承認限度額を超えています')
    }

    // 承認実行
    const events = request.approve(new UserId(approver.getId()), comment)
    
    return { 
      success: true,
      events,
      notificationTargets: [request.getCreatedBy()]
    }
  }

  private exceedsApprovalLimit(amount: Money, approver: User): boolean {
    const limits: Record<UserRole, Money> = {
      requester: new Money(0),
      approver: new Money(1000000), // 100万円
      admin: new Money(10000000), // 1000万円
    }
    
    const limit = limits[approver.getRole()]
    return amount.isGreaterThan(limit)
  }
}
```

### 4.2 申請ワークフローサービス
```typescript
// external/domain/services/request-workflow-service.ts
export class RequestWorkflowService {
  determineApprover(
    request: Request,
    availableApprovers: User[]
  ): User | null {
    // ビジネスルールに基づいて承認者を決定
    const requestType = request.getType()
    const amount = request.getAmount()

    // 金額に基づいた承認者の選定
    if (amount && amount.isGreaterThan(new Money(500000))) {
      // 50万円以上は管理者のみ
      return availableApprovers.find(u => u.getRole() === 'admin') || null
    }

    // タイプに基づいた承認者の選定
    if (requestType === 'access') {
      // アクセス申請はIT部門の承認者
      return availableApprovers.find(u => 
        u.canApproveRequest() && u.getDepartment() === 'IT'
      ) || null
    }

    // デフォルトは任意の承認者
    return availableApprovers.find(u => u.canApproveRequest()) || null
  }

  canTransition(
    from: RequestStatus,
    to: RequestStatus,
    actor: User
  ): boolean {
    // ステータス遷移の可否を判定
    const transitions: Record<RequestStatus, RequestStatus[]> = {
      draft: ['submitted'],
      submitted: ['approved', 'rejected'],
      approved: [],
      rejected: [],
    }

    if (!transitions[from]?.includes(to)) {
      return false
    }

    // アクターの権限チェック
    if (to === 'submitted') {
      return true // 申請者本人
    }
    
    if (to === 'approved' || to === 'rejected') {
      return actor.canApproveRequest()
    }

    return false
  }
}
```

### 4.3 監査サービス
```typescript
// external/domain/services/audit-service.ts
export class AuditService {
  createAuditLog(
    event: DomainEvent,
    actor: User,
    context: AuditContext
  ): AuditLog {
    const log = new AuditLog(
      generateId(),
      new UserId(actor.getId()),
      this.mapEventToTargetType(event),
      event.aggregateId,
      this.mapEventToAction(event),
      {
        eventType: event.type,
        eventData: event.payload,
        userRole: actor.getRole(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
      event.occurredAt
    )

    // 高リスクアクションの検出
    if (log.isHighRiskAction()) {
      // アラート通知などの処理
    }

    return log
  }

  private mapEventToTargetType(event: DomainEvent): TargetType {
    if (event.type.includes('Request')) return 'request'
    if (event.type.includes('User')) return 'user'
    if (event.type.includes('Attachment')) return 'attachment'
    if (event.type.includes('Comment')) return 'comment'
    throw new Error(`Unknown event type: ${event.type}`)
  }

  private mapEventToAction(event: DomainEvent): AuditAction {
    const mapping: Record<string, AuditAction> = {
      RequestCreated: 'create',
      RequestUpdated: 'update',
      RequestDeleted: 'delete',
      RequestSubmitted: 'submit',
      RequestApproved: 'approve',
      RequestRejected: 'reject',
      CommentAdded: 'comment',
      AttachmentAdded: 'attach',
      AttachmentRemoved: 'detach',
    }
    
    return mapping[event.type] || 'unknown'
  }
}
```

## 5. ドメインイベント

ドメインで発生した重要な出来事を表現します。

```typescript
// external/domain/shared/events/domain-event.ts
export abstract class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly occurredAt: Date,
    public readonly type: string,
    public readonly payload: Record<string, any>
  ) {}
}

// external/domain/request/events/request-events.ts
export class RequestSubmittedEvent extends DomainEvent {
  constructor(
    requestId: string,
    submittedBy: UserId,
    occurredAt: Date
  ) {
    super(
      requestId,
      occurredAt,
      'RequestSubmitted',
      { submittedBy: submittedBy.getValue() }
    )
  }
}

export class RequestApprovedEvent extends DomainEvent {
  constructor(
    requestId: string,
    approvedBy: UserId,
    occurredAt: Date
  ) {
    super(
      requestId,
      occurredAt,
      'RequestApproved',
      { approvedBy: approvedBy.getValue() }
    )
  }
}

export class RequestRejectedEvent extends DomainEvent {
  constructor(
    requestId: string,
    rejectedBy: UserId,
    reason: string,
    occurredAt: Date
  ) {
    super(
      requestId,
      occurredAt,
      'RequestRejected',
      { 
        rejectedBy: rejectedBy.getValue(),
        reason 
      }
    )
  }
}
```

## 6. ドメインリポジトリインターフェース

```typescript
// external/domain/request/repository-interface.ts
export interface RequestRepository {
  findById(id: string): Promise<RequestAggregate | null>
  findByCreatedBy(userId: UserId): Promise<RequestAggregate[]>
  findPendingApprovals(): Promise<RequestAggregate[]>
  save(request: RequestAggregate): Promise<void>
  delete(id: string): Promise<void>
}

// external/domain/user/repository-interface.ts
export interface UserRepository {
  findById(id: UserId): Promise<UserAggregate | null>
  findByEmail(email: Email): Promise<UserAggregate | null>
  findApprovers(): Promise<UserAggregate[]>
  save(user: UserAggregate): Promise<void>
}
```

## まとめ

このドメインモデルは以下の特徴を持ちます：

1. **明確な境界**: 各集約が一貫性の境界を定義
2. **不変性**: 値オブジェクトは不変で、ビジネスルールを内包
3. **カプセル化**: ビジネスロジックはドメインオブジェクト内に隠蔽
4. **イベント駆動**: 重要なドメインイベントを明示的に表現
5. **テスタビリティ**: 外部依存を最小限にし、単体テストが容易