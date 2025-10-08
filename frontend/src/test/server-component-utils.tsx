import { Suspense } from "react";

import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { vi } from "vitest";

/**
 * Helper to test server components
 * Wraps component in Suspense boundary which is required for async components
 */
export async function renderServerComponent(
  component: React.ReactElement,
  options?: RenderOptions
) {
  const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
  );

  const result = rtlRender(component, {
    wrapper: SuspenseWrapper,
    ...options,
  });

  // Wait for any async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 0));

  return result;
}

/**
 * Mock async data fetching for server components
 */
export function mockServerFetch<T>(data: T, delay = 0) {
  return vi.fn().mockImplementation(async () => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return data;
  });
}

/**
 * Mock server action
 */
export function mockServerAction<TArgs extends unknown[], TReturn>(
  implementation?: (...args: TArgs) => Promise<TReturn>
) {
  const fn = vi.fn(implementation);

  // Add server action properties
  Object.defineProperty(fn, "$$typeof", {
    value: Symbol.for("react.server.reference"),
  });

  return fn;
}
