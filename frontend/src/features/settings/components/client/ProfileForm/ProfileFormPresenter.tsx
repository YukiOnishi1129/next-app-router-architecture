'use client'

import { Button } from '@/shared/components/ui/button'

import type { ProfileFormPresenterProps } from './useProfileForm'

export function ProfileFormPresenter({
  register,
  errors,
  canSubmit,
  onSubmit,
  onReset,
  successMessage,
  updateError,
  isUpdating,
}: ProfileFormPresenterProps) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <header className="space-y-1">
        <h2 className="text-base font-medium">プロフィール設定</h2>
        <p className="text-muted-foreground text-sm">
          氏名とメールアドレスを更新できます。
        </p>
      </header>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">氏名</span>
        <input
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          placeholder="山田 太郎"
          {...register('name', { required: '氏名を入力してください' })}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <span className="text-destructive text-xs">
            {errors.name.message}
          </span>
        ) : null}
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">メールアドレス</span>
        <input
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          type="email"
          placeholder="user@example.com"
          {...register('email', {
            required: 'メールアドレスを入力してください',
          })}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <span className="text-destructive text-xs">
            {errors.email.message}
          </span>
        ) : null}
      </label>

      {updateError ? (
        <p className="text-destructive text-sm">
          更新に失敗しました: {updateError.message}
        </p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-emerald-600">{successMessage}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!canSubmit}>
          {isUpdating ? '更新中…' : '変更を保存'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isUpdating || !canSubmit}
          onClick={onReset}
        >
          取り消す
        </Button>
      </div>
    </form>
  )
}
