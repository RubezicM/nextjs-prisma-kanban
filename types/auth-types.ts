import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface ExtendedToken extends JWT {
  userId: string;
  provider: string;
}

export interface ExtendedSession extends Session {
  user: Session["user"] & {
    id: string;
    provider: string;
  };
}
