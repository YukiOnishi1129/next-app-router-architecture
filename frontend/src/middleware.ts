import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

const EMAIL_CHANGE_LOGIN_PATH = '/auth/email-change-login'
const PREVIOUS_EMAIL_COOKIE = 'email-change.previous-email'

export function middleware(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  if (
    pathname === EMAIL_CHANGE_LOGIN_PATH ||
    pathname.startsWith(`${EMAIL_CHANGE_LOGIN_PATH}/`) ||
    pathname.startsWith('/auth/verify-email-change') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const hasPendingEmailChange = request.cookies.has(PREVIOUS_EMAIL_COOKIE)

  if (!hasPendingEmailChange) {
    return NextResponse.next()
  }

  const targetUrl = new URL(
    `${EMAIL_CHANGE_LOGIN_PATH}?verified=1`,
    request.url
  )
  return NextResponse.redirect(targetUrl)
}

export const config = {
  matcher: ['/((?!favicon\\.ico).*)'],
}
