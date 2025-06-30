import { auth } from "@/auth"
import { AuthStatus } from "@/components/auth/auth-status"

export default async function Home() {
    const session = await auth()

    return (
        <main className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-semibold">My App</h1>
                        <AuthStatus />
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
                    </h2>
                    <p className="text-gray-600">
                        {session
                            ? "You are signed in with Google."
                            : "Sign in to access your dashboard."}
                    </p>
                </div>
            </div>
        </main>
    )
}
