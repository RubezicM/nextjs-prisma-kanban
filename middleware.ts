import NextAuth from "next-auth"
import { authConfig } from "@/auth"

// Create auth middleware with just the config (no prisma)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard") && !isLoggedIn) {
        const newUrl = new URL("/auth/signin", req.nextUrl.origin)
        newUrl.searchParams.set("callbackUrl", pathname)
        return Response.redirect(newUrl)
    }

    // Redirect logged in users away from auth pages
    if (pathname.startsWith("/auth") && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", req.nextUrl.origin))
    }
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}
