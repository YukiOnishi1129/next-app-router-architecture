"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";

type DraftRequest = {
  title: string;
  amount: string;
  reason: string;
};

export function RequestForm() {
  const [draft, setDraft] = useState<DraftRequest>({
    title: "",
    amount: "",
    reason: "",
  });

  const handleChange = <Field extends keyof DraftRequest>(
    field: Field,
    value: DraftRequest[Field]
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder submission logic. Replace with createRequestAction.
    console.info("Submitting draft request", draft);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium">
        Title
        <input
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          name="title"
          value={draft.title}
          onChange={(event) => handleChange("title", event.target.value)}
          required
        />
      </label>

      <label className="block text-sm font-medium">
        Amount (optional)
        <input
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          name="amount"
          type="number"
          value={draft.amount}
          onChange={(event) => handleChange("amount", event.target.value)}
          min={0}
          step="0.01"
        />
      </label>

      <label className="block text-sm font-medium">
        Reason
        <textarea
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          name="reason"
          rows={4}
          value={draft.reason}
          onChange={(event) => handleChange("reason", event.target.value)}
          required
        />
      </label>

      <Button type="submit" className="w-full sm:w-auto">
        Submit request
      </Button>
    </form>
  );
}
