import { getServerSession } from "next-auth";
import "server-only";

import { authOptions } from "@/features/auth/lib/option";

export const getSessionServer = async () => {
  const session = await getServerSession(authOptions);
  return session;
};
