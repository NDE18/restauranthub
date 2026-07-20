import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Rediriger les non-admins hors de /admin
    if (pathname.startsWith('/admin')) {
      const roles: string[] = (token?.roles as string[]) || []
      if (!roles.includes('ROLE_SUPER_ADMIN') && !roles.includes('ROLE_MANAGER')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Pages protégées
        if (pathname.startsWith('/mon-compte') || pathname.startsWith('/admin')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/mon-compte/:path*', '/admin/:path*'],
}
