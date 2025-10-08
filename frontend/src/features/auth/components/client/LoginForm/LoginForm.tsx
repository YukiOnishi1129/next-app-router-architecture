"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Integrate with signIn action once implemented
    console.info("Attempted sign-in", { email, password });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium">
        Email
        <input
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}
