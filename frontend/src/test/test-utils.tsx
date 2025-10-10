import React, { ReactElement, ReactNode, useRef } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  RenderOptions,
  renderHook as rtlRenderHook,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionProvider } from 'next-auth/react'

import type {
  RenderHookOptions,
  RenderHookResult,
} from '@testing-library/react'
import type { Session } from 'next-auth'

// Mock session for tests
const mockSession: Session = {
  account: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['ADMIN'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
}

// Add any providers here that your app needs globally
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  const queryClientRef = useRef<QueryClient>()
  if (!queryClientRef.current) {
    queryClientRef.current = createTestQueryClient()
  }

  return (
    <SessionProvider session={mockSession}>
      <QueryClientProvider client={queryClientRef.current}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'

export const renderHook = <TResult, TProps>(
  callback: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
): RenderHookResult<TResult, TProps> =>
  rtlRenderHook(callback, { wrapper: AllTheProviders, ...options })

// Override render method
export { customRender as render }

// Export userEvent with setup
export const user = userEvent.setup()

// Utility to render with async component support
export async function renderAsync(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const result = customRender(ui, options)
  // Wait for any async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 0))
  return result
}

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  image: '/test-avatar.png',
  ...overrides,
})

// Common test IDs
export const testIds = {
  // Layout
  header: 'header',
  footer: 'footer',
  navigation: 'navigation',

  // Auth
  loginButton: 'login-button',
  logoutButton: 'logout-button',
  userMenu: 'user-menu',

  // Common UI
  spinner: 'spinner',
  errorMessage: 'error-message',
  successMessage: 'success-message',
} as const
