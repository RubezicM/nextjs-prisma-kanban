import { DefaultSession } from "next-auth"

// Add this line to test if file is being read
type TestType = "FILE_IS_BEING_READ"
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            provider: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        email: string
        name: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId: string
        provider: string
    }
}
