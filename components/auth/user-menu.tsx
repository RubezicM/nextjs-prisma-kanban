import { auth } from "@/auth"
import { signOutAction } from "@/lib/actions/auth-actions"

export async function UserMenu() {
    const session = await auth()

    if (!session?.user) return null

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">

                <span className="text-sm font-medium">{session.user.name}</span>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
                <form action={signOutAction}>
                    <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Sign out
                    </button>
                </form>
            </div>
        </div>
    )
}
