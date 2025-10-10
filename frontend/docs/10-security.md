# Security Considerations

## Identity Platform Integration

The project talks directly to **Google Identity Platform** via REST (no Firebase SDK). `IdentityPlatformClient` wraps the API surface and `AuthenticationService` exposes app-friendly methods (sign-up, sign-in, refresh, profile updates).

```ts
// external/service/auth/AuthenticationService.ts
async refreshToken(refreshToken: string) {
  try {
    const result = await this.identityPlatformClient.refreshIdToken(refreshToken)
    return {
      token: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    }
  } catch (error) {
    console.error('Token refresh failed', error)
    return null
  }
}
```

## Session & Cookie Handling

`features/auth/servers/token.server.ts` owns cookie management:

- `id-token` (httpOnly, SameSite=Lax, secure in production, 1 hour lifetime)
- `refresh-token` (httpOnly, 30 days)

`refreshIdTokenServer` decodes the current ID token, refreshes it via `refreshIdTokenCommandServer` (which calls `https://securetoken.googleapis.com/v1/token`), and updates both cookies if necessary.

```ts
const SKEW = 60
export const refreshIdTokenServer = async () => {
  const idToken = await getIdTokenServer()
  const { exp } = idToken ? (decodeJwt(idToken) as { exp?: number }) : {}
  const now = Math.floor(Date.now() / 1000)

  if (idToken && exp && exp > now + SKEW) return idToken

  const refreshToken = await getRefreshTokenServer()
  if (!refreshToken) throw new Error('unauthorized')

  const data = await refreshIdTokenCommandServer({ refreshToken })
  if (!data.success || !data.idToken) throw new Error('unauthorized')

  await setIdTokenCookieServer(data.idToken)
  if (data.refreshToken) await setRefreshTokenCookieServer(data.refreshToken)

  return data.idToken
}
```

## Middleware Guidance

We avoid heavy verification in middleware; route groups plus `requireAuthServer` handle guards. If middleware is required, perform a light `id-token` existence check and defer full verification to server components/Server Actions.

```ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const hasIdToken = request.cookies.get('id-token')
  if (!hasIdToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

## CSRF Protection

Use synchroniser tokens when exposing Server Actions via forms.

```ts
export function generateCSRFToken() {
  const token = randomBytes(32).toString('hex')
  cookies().set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60,
  })
  return token
}
```

## Input Validation & Sanitisation

Zod handles validation for every command/query handler. Sanitise user-supplied HTML using `isomorphic-dompurify` before persistence/display.

```ts
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Please enter a comment')
    .max(1000, 'Max length is 1000 characters')
    .transform((value) => DOMPurify.sanitize(value, { ALLOWED_TAGS: [] })),
})
```

## Environment Variables

Validate required variables at startup to avoid misconfiguration.

```ts
const envSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  GCP_IDENTITY_PLATFORM_API_KEY: z.string(),
  GCP_PROJECT_ID: z.string(),
  DATABASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

## Content Security Policy

Inject a strict CSP from `app/layout.tsx` (or middleware) to limit origins for scripts, styles, images, and external frames.

```tsx
<meta
  httpEquiv="Content-Security-Policy"
  content={`default-src 'self'; connect-src 'self' https://identitytoolkit.googleapis.com;`}
/>
```

## Rate Limiting

For public endpoints (e.g., login), use a sliding window limiter backed by Redis/upstash to mitigate brute-force attacks.

```ts
const limiter = new SlidingWindow(limitStore, {
  interval: 60 * 1000,
  maxHits: 10,
})
```

## Checklist

- [ ] `id-token` / `refresh-token` cookies are httpOnly + secure (prod).
- [ ] Server-only modules declare `import 'server-only'`.
- [ ] All handler inputs validated via Zod DTOs.
- [ ] Refresh token never exposed to the browser runtime.
- [ ] Sign-in/up/out actions are logged by `AuditService`.
