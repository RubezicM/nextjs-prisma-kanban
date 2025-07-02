import NextAuth from "next-auth"
import { authConfig } from "@/auth"

// Create auth middleware with just the config (no prisma)
const { auth } = NextAuth(authConfig)


// make async

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl
    console.log('Middleware running for path:', req)

    // === PROTECTED ROUTES ===
    // Protect workspace routes
    if (pathname.startsWith("/board") && !isLoggedIn) {
        const newUrl = new URL("/auth/sign-in", req.nextUrl.origin)
        newUrl.searchParams.set("callbackUrl", pathname)
        return Response.redirect(newUrl)
    }

    // Protect join route
    if (pathname.startsWith("/join") && !isLoggedIn) {
        const newUrl = new URL("/auth/sign-in", req.nextUrl.origin)
        newUrl.searchParams.set("callbackUrl", pathname)
        return Response.redirect(newUrl)
    }

    // Redirect logged in users away from auth pages
    if (pathname.startsWith("/auth") && isLoggedIn) {
        return Response.redirect(new URL("/join", req.nextUrl.origin))
    }

    if (pathname === "/" && isLoggedIn) {
        return Response.redirect(new URL("/join", req.nextUrl.origin))
    }

    // === PUBLIC ROUTES ===
    // Allow public access to home page for unauthenticated users
    if (pathname === "/" && !isLoggedIn) {
        // Let them see landing page
        return
    }

    // Allow auth pages for unauthenticated users
    if (pathname.startsWith("/auth") && !isLoggedIn) {
        return
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
