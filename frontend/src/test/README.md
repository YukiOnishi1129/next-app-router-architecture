# Testing Setup Guide

This directory contains the testing infrastructure for the Next.js application using Vitest and React Testing Library.

## Overview

The testing environment is configured with:
- **Vitest** - Fast unit test framework with excellent TypeScript support
- **React Testing Library** - For testing React components with user-centric queries
- **@testing-library/user-event** - For simulating user interactions
- **@testing-library/jest-dom** - For additional DOM assertions

## Configuration Files

- `vitest.config.ts` - Main Vitest configuration
- `src/test/setup.ts` - Global test setup with mocks and utilities
- `src/test/test-utils.tsx` - Custom render functions and test utilities
- `src/test/server-component-utils.tsx` - Utilities for testing server components

## Test Scripts

```bash
npm run test          # Run tests in watch mode
npm run test:ui       # Run tests with UI dashboard
npm run test:run      # Run all tests once (CI mode)
npm run test:coverage # Run tests with coverage report
```

## Writing Tests

### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```tsx
import userEvent from '@testing-library/user-event'

it('handles click events', async () => {
  const user = userEvent.setup()
  const handleClick = vi.fn()
  
  render(<Button onClick={handleClick}>Click me</Button>)
  
  await user.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalled()
})
```

### Testing Async Components

```tsx
import { waitFor } from '@/test/test-utils'

it('loads data', async () => {
  render(<AsyncComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

## Mocked Dependencies

The following Next.js features are mocked:
- `next/image` - Image component
- `next/link` - Link component
- `next/navigation` - Router hooks
- `next-auth/react` - Authentication
- CSS imports and modules

## Best Practices

1. Use `screen` queries instead of destructuring from render
2. Prefer `userEvent` over `fireEvent` for user interactions
3. Use `data-testid` sparingly, prefer accessible queries
4. Write tests that resemble how users interact with your app
5. Mock external dependencies at the module level
6. Keep tests focused and independent

## Troubleshooting

### Common Issues

1. **CSS Module Errors**: CSS is mocked in the setup file
2. **Async Warnings**: Use `waitFor` for async operations
3. **Next.js Features**: Check if the feature is mocked in setup.ts
4. **Type Errors**: Ensure TypeScript types are installed

### Debug Tips

- Use `screen.debug()` to see the current DOM
- Check the test output for helpful error messages
- Run individual tests with `-t "test name"` flag