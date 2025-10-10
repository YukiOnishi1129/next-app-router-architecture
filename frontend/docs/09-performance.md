# Performance Playbook

## Next.js App Router Features

1. **Server Components** – default server rendering keeps the client bundle small. Fetch data inside server components whenever possible.
2. **Streaming + Suspense** – split expensive UI into suspense boundaries so critical content renders first.
3. **Partial Prerendering (experimental)** – opt specific routes in via `experimental.ppr` to prerender static shells while streaming dynamic sections.

## Image Optimisation

Use Next.js `<Image>` with responsive sizing, AVIF/WebP formats, and `priority` for LCP-critical imagery. Configure `next.config.ts` with `remotePatterns` when pulling from object storage.

```tsx
// components/ProductImage.tsx
export function ProductImage({ src, alt, priority = false }: Props) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        className="object-cover"
      />
    </div>
  )
}
```

## React Query Tuning

- Set `staleTime`/`gcTime` to match data volatility.
- Use `prefetchQuery` + `HydrationBoundary` to avoid waterfalling on navigation.
- Leverage `invalidateQueries` or `setQueryData` for optimistic UX after mutations.

## Bundle Hygiene

- Prefer dynamic `import()` for rarely used client components.
- Hoist heavy dependencies (charts, editors) behind `lazy` boundaries.
- Monitor with `next build --profile` or community bundle analyzers.

## Database & API

- Use indexed queries via Drizzle; rely on Postgres EXPLAIN to confirm plans.
- Keep Identity Platform calls server-side; cache user profiles in memory when acceptable.
- Debounce or batch client-triggered mutations to reduce write load.

## Observability

- Log audit events on every auth / approval state change.
- Instrument critical paths (request approval, sign-in) via structured logs; promote to tracing when a backing stack is available.

## Checklist

- [ ] Server components cover first-paint data.
- [ ] Suspense boundaries split long-running UI.
- [ ] Images use `<Image>` with responsive sizing.
- [ ] React Query cache tuned per feature.
- [ ] No privileged logic leaks into the client bundle.
