import { auth } from "@/auth";

import { signOutAction } from "@/lib/actions/auth-actions";

import UserLoginButton from "@/components/shared/header/user-login-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserButton = async () => {
  const session = await auth();

  if (!session) {
    return <UserLoginButton />;
  }

  // memoize firstInitial t
  const firstInitial = session.user?.name?.charAt(0).toUpperCase() || "";

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="bg-accent relative ml-2 flex h-8 w-8 items-center justify-center rounded-full"
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="text-sm leading-none font-medium">{session.user?.name || "User"}</div>
              <div className="text-muted-foreground text-sm leading-none">
                {session.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem asChild className="mb-1 p-0">
            <form action={signOutAction} className="w-full">
              <Button type="submit" className="h-4 w-full justify-start px-2 py-4" variant="ghost">
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
