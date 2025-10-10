# Frontend Architecture Docs

This folder captures detailed design and implementation guidance for the Next.js App Router frontend.

## Table of Contents

1. [Directory Structure](./01-directory-structure.md)  
2. [Tech Stack](./02-tech-stack.md)  
3. [External Layer](./03-external-layer.md)  
4. [State Management](./04-state-management.md)  
5. [Form Handling](./05-form-handling.md)  
6. [UI Components](./06-ui-components.md)  
7. [Types & Schemas](./07-types-and-schemas.md)  
8. [Testing Strategy](./08-testing-strategy.md)  
9. [Performance Playbook](./09-performance.md)  
10. [Security Considerations](./10-security.md)  
11. [Routing & Layouts](./11-routing-and-layouts.md)  
12. [Data Fetching Patterns](./12-data-fetching.md)  
13. [ESLint & Code Rules](./13-eslint-rules.md)  
14. [Custom Hooks Guide](./14-hooks.md)  
15. [Storybook Guide](./15-storybook.md)  
16. [Auth Refactoring Notes](./16-auth-refactoring.md)  
17. [Authentication Flow](./17-authentication-flow.md)  
18. [DDD Domain Analysis](./18-ddd-domain-analysis.md)  
19. [Domain Model Example](./19-domain-model-example.md)  
20. [Architecture Deep Dive](./20-architecture-deep-dive.md)  
21. [Setup Guide](./21-setup-guide.md)

## Design Principles

1. **Separation of concerns** – Keep UI, business logic, and data access isolated per layer.
2. **Type safety** – Rely on TypeScript + Zod for end-to-end safety.
3. **Reusability** – Container/Presenter split and shared utilities keep components composable.
4. **Testability** – Hooks and services favour dependency injection/mocking.
5. **Performance** – Server-first data fetching and measured client hydration.

## Getting Started

Review the [Setup Guide](./21-setup-guide.md) for environment provisioning and developer tooling.
