import { auth } from "@/auth"
import { SignInButton } from "./signin-button"
import { UserMenu } from "./user-menu"

export async function AuthStatus() {
    const session = await auth()

    return session ? <UserMenu /> : <SignInButton />
}
