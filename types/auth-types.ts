import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

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
