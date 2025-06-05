import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/', '/signup', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const user = request.cookies.get('user')

  if (user && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/promotion', request.url))
  }

  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  if (!user) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [

    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
} 