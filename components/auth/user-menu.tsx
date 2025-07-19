import { auth } from "@/auth";
import { signOutAction } from "@/lib/actions/auth-actions";

export async function UserMenu() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <div className="group relative">
      <button className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-100">
        <span className="text-sm font-medium">{session.user.name}</span>
      </button>

      <div className="invisible absolute right-0 mt-2 w-48 rounded-lg bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
        <div className="border-b px-4 py-2">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-gray-500">{session.user.email}</p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
