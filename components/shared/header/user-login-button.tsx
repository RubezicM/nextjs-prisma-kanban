import { FaRegUser } from "react-icons/fa";

import SignInButtons from "@/components/auth/signin-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const UserLoginButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <>
            <FaRegUser /> Sign in
          </>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>Please sign in using one of the following providers</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <SignInButtons />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserLoginButton;
