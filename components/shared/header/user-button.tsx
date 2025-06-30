import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/actions/auth-actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserLoginButton from "@/components/shared/header/user-login-button";

const UserButton = async () => {
  const session = await auth();


  if (!session) {
    return <UserLoginButton/>;
  }


  // memoize firstInitial t
  const firstInitial = session.user?.name?.charAt(0).toUpperCase() || "";

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="relative w-8 h-8 rounded-full flex items-center ml-2 justify-center bg-accent"
            >
              {/*<UserIcon />*/}
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium leading-none">
                {session.user?.name || "User"}
              </div>
              <div className="text-sm text-muted-foreground leading-none">
                {session.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem asChild className="p-0 mb-1">
            <form action={signOutAction} className="w-full">
              <Button
                type="submit"
                className="w-full py-4 px-2 h-4 justify-start"
                variant="ghost"
              >
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
