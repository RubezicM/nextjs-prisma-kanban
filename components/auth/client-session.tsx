"use client"

import { useSession } from "next-auth/react"

export function ClientSession() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (session) {
        return (
            <div>
                <p>Signed in as {session.user?.email}</p>
            </div>
        )
    }

    return <div>Not signed in</div>
}
