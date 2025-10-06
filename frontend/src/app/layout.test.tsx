import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import RootLayout from './layout'

// Mock the Next.js font imports
vi.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
  }),
}))

// Mock the AuthProvider since it's already mocked in test-utils
vi.mock('@/features/auth/providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('RootLayout', () => {
  it('renders children within the layout', () => {
    // RootLayout renders an html element which cannot be inside a div
    // We need to render it differently
    const result = render(
      <div data-testid="child-element">Test Content</div>,
      {
        wrapper: ({ children }) => <RootLayout>{children}</RootLayout>
      }
    )
    
    const childElement = screen.getByTestId('child-element')
    expect(childElement).toBeInTheDocument()
    expect(childElement).toHaveTextContent('Test Content')
  })

  it('renders with proper structure', () => {
    // Since RootLayout returns html/body elements, we need to test differently
    const TestComponent = () => <div data-testid="test">Content</div>
    
    render(<TestComponent />, {
      wrapper: ({ children }) => <RootLayout>{children}</RootLayout>
    })
    
    // Check that content is rendered
    expect(screen.getByTestId('test')).toBeInTheDocument()
    
    // Check body classes by looking at the parent of our content
    const testElement = screen.getByTestId('test')
    const bodyElement = testElement.closest('body')
    
    expect(bodyElement).toBeTruthy()
    expect(bodyElement?.className).toContain('antialiased')
  })

  it('renders multiple children', () => {
    const TestComponent = () => (
      <>
        <header>Header</header>
        <main>Main Content</main>
        <footer>Footer</footer>
      </>
    )
    
    render(<TestComponent />, {
      wrapper: ({ children }) => <RootLayout>{children}</RootLayout>
    })
    
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})