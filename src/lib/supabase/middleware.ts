import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refresh the Supabase session cookie and gate `/dashboard`.
 *
 * This runs on essentially every request (see the matcher in `src/proxy.ts`),
 * which makes it the single most dangerous place in the app to throw: an
 * uncaught error here returns a bare 500 for every route, including the
 * landing page and the legal pages, which need no auth at all.
 *
 * So it fails *open*. If Supabase is misconfigured, unreachable, or the
 * project is paused, public pages still render and only `/dashboard` is
 * turned away — a signed-out experience rather than an outage.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')

  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    return NextResponse.redirect(url)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // These are inlined at build time, so an empty value here means the deploy
  // was built without them — not a runtime blip.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[proxy] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are ' +
        'missing from this build. Serving public routes signed-out.'
    )
    return isProtectedRoute ? redirectTo('/login') : supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  let user = null
  try {
    // `getUser` is a network call to Supabase. A paused project or a provider
    // outage rejects here, and that must not become a site-wide 500.
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (error) {
    console.error('[proxy] could not reach Supabase Auth:', error)
    return isProtectedRoute ? redirectTo('/login') : supabaseResponse
  }

  if (!user && isProtectedRoute) return redirectTo('/login')
  if (user && isAuthRoute) return redirectTo('/dashboard')

  return supabaseResponse
}
