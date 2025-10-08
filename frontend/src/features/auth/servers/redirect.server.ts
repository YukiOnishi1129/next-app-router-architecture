import "server-only";

import { redirect } from "next/navigation";

import { getSessionServer } from "./session.server";

export async function requireAuthServer() {
  const session = await getSessionServer();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function redirectIfAuthenticatedServer() {
  const session = await getSessionServer();
  if (session) {
    redirect("/requests");
  }
  return session;
}
