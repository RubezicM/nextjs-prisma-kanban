import { FaRegUser } from "react-icons/fa";

import LoginAuthPanel from "@/components/auth/panels/login-auth-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const UserLoginButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-accent/80 text-primary-foreground">
          <FaRegUser /> <span className="text-primary-foreground">Sign in</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>Login with one of the providers</DialogDescription>
          <LoginAuthPanel />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UserLoginButton;
