# フォーム処理

## React Hook Form + Zod

このプロジェクトでは、React Hook FormとZodを組み合わせて、型安全で堅牢なフォーム処理を実現します。

## 基本的なフォーム実装

### スキーマ定義

```typescript
// features/users/schemas/userSchema.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100, '100文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  age: z.number().min(0, '年齢は0以上で入力してください').max(150),
  role: z.enum(['admin', 'user', 'guest'], {
    errorMap: () => ({ message: '有効な役割を選択してください' }),
  }),
  bio: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// 更新用スキーマ（部分的な更新を許可）
export const updateUserSchema = createUserSchema.partial()
export type UpdateUserInput = z.infer<typeof updateUserSchema>
```

### フォームコンポーネント

```typescript
// features/users/components/CreateUserForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserInput } from '../schemas/userSchema'
import { useCreateUser } from '../mutations/useCreateUser'
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

export function CreateUserForm() {
  const createUser = useCreateUser()
  
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0,
      role: 'user',
      bio: '',
    },
  })

  async function onSubmit(data: CreateUserInput) {
    try {
      await createUser.mutateAsync(data)
      form.reset()
    } catch (error) {
      // エラーはuseMutationのonErrorで処理
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="山田太郎" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>年齢</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>役割</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="役割を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="user">ユーザー</SelectItem>
                  <SelectItem value="guest">ゲスト</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting || createUser.isPending}
        >
          {form.formState.isSubmitting ? '送信中...' : 'ユーザーを作成'}
        </Button>
      </form>
    </Form>
  )
}
```

## Server Actionsとの連携

### Server Action定義

```typescript
// external/actions/users.ts
'use server'

import { createUserSchema } from '@/features/users/schemas/userSchema'
import { createUser } from '../db/users'
import { revalidatePath } from 'next/cache'

export async function createUserAction(input: unknown) {
  // サーバー側でもバリデーション
  const validated = createUserSchema.safeParse(input)
  
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    const user = await createUser(validated.data)
    revalidatePath('/users')
    return { success: true, data: user }
  } catch (error) {
    return { 
      success: false, 
      error: 'ユーザーの作成に失敗しました' 
    }
  }
}
```

### フォームでServer Actionを使用

```typescript
// features/users/components/CreateUserFormWithAction.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createUserAction } from '@/external/actions/users'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '送信中...' : '送信'}
    </Button>
  )
}

export function CreateUserFormWithAction() {
  const [state, formAction] = useFormState(createUserAction, {
    success: false,
  })

  return (
    <form action={formAction}>
      <Input name="name" required />
      <Input name="email" type="email" required />
      <Input name="age" type="number" required />
      
      {state.errors?.name && (
        <p className="text-red-500">{state.errors.name}</p>
      )}
      
      {state.error && (
        <p className="text-red-500">{state.error}</p>
      )}
      
      {state.success && (
        <p className="text-green-500">ユーザーを作成しました</p>
      )}
      
      <SubmitButton />
    </form>
  )
}
```

## 高度なフォームパターン

### 動的フォームフィールド

```typescript
// features/products/components/ProductVariantsForm.tsx
import { useFieldArray } from 'react-hook-form'

function ProductVariantsForm() {
  const form = useForm({
    defaultValues: {
      variants: [{ name: '', price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <Input
            {...form.register(`variants.${index}.name`)}
            placeholder="バリアント名"
          />
          <Input
            {...form.register(`variants.${index}.price`, {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="価格"
          />
          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(index)}
          >
            削除
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        onClick={() => append({ name: '', price: 0 })}
      >
        バリアントを追加
      </Button>
    </form>
  )
}
```

### 条件付きバリデーション

```typescript
// features/orders/schemas/orderSchema.ts
const orderSchema = z.object({
  deliveryMethod: z.enum(['pickup', 'delivery']),
  address: z.string().optional(),
}).refine(
  (data) => {
    if (data.deliveryMethod === 'delivery') {
      return !!data.address && data.address.length > 0
    }
    return true
  },
  {
    message: '配送の場合は住所が必須です',
    path: ['address'],
  }
)
```

### ファイルアップロード

```typescript
// features/users/components/AvatarUpload.tsx
import { useForm } from 'react-hook-form'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const avatarSchema = z.object({
  avatar: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'ファイルを選択してください')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      'ファイルサイズは5MB以下にしてください'
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      'JPG、PNG、WebP形式のみ対応しています'
    ),
})

export function AvatarUpload() {
  const form = useForm({
    resolver: zodResolver(avatarSchema),
  })

  async function onSubmit(data: { avatar: FileList }) {
    const formData = new FormData()
    formData.append('avatar', data.avatar[0])
    
    // Server Actionまたはアップロードエンドポイントへ送信
    await uploadAvatar(formData)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        type="file"
        accept="image/*"
        {...form.register('avatar')}
      />
      <FormMessage />
      <Button type="submit">アップロード</Button>
    </form>
  )
}
```

## エラーハンドリング

### フィールドレベルのエラー

```typescript
// サーバーからのエラーをフォームに設定
const handleServerErrors = (errors: FieldErrors) => {
  Object.entries(errors).forEach(([field, messages]) => {
    form.setError(field as Path<FormData>, {
      type: 'server',
      message: Array.isArray(messages) ? messages[0] : messages,
    })
  })
}
```

### グローバルエラー

```typescript
// フォーム全体のエラー表示
{form.formState.errors.root && (
  <Alert variant="destructive">
    <AlertDescription>
      {form.formState.errors.root.message}
    </AlertDescription>
  </Alert>
)}
```

## ベストプラクティス

1. **常にサーバー側でもバリデーション**: クライアント側の検証は迂回可能
2. **適切なエラーメッセージ**: ユーザーフレンドリーで具体的なメッセージ
3. **プログレッシブエンハンスメント**: JavaScriptが無効でも動作するように
4. **アクセシビリティ**: 適切なARIA属性とラベル
5. **最適化**: デバウンスやスロットリングで過剰な検証を防ぐ