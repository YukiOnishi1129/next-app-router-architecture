'use client'

import { Button } from '@/shared/components/ui/button'

import type { SignUpFormPresenterProps } from './useSignUpForm'

export function SignUpFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
  serverError,
}: SignUpFormPresenterProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="name">
          氏名
        </label>
        <input
          id="name"
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="text"
          {...register('name')}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="email">
          メールアドレス
        </label>
        <input
          id="email"
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="password">
          パスワード
        </label>
        <input
          id="password"
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="password"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <p className="text-destructive text-xs">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          パスワード（確認）
        </label>
        <input
          id="confirmPassword"
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="password"
          {...register('confirmPassword')}
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        {errors.confirmPassword ? (
          <p className="text-destructive text-xs">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <p className="text-destructive text-sm">{serverError}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '登録中…' : 'アカウントを作成'}
      </Button>
    </form>
  )
}
