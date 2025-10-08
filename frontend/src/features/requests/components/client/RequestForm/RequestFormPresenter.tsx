"use client";

import { Button } from "@/shared/components/ui/button";

import type { CreateRequestFormValues } from "@/features/requests/schemas";
import type { UseFormReturn } from "react-hook-form";

type RequestFormPresenterProps = {
  form: UseFormReturn<CreateRequestFormValues>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function RequestFormPresenter({
  form,
  onSubmit,
}: RequestFormPresenterProps) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm font-medium">
        Title
        <input
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          {...register("title")}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title ? (
          <p className="text-destructive mt-1 text-xs">
            {errors.title.message}
          </p>
        ) : null}
      </label>

      <label className="block text-sm font-medium">
        Amount (optional)
        <input
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="number"
          step="0.01"
          min={0}
          {...register("amount")}
          aria-invalid={Boolean(errors.amount)}
        />
        {errors.amount ? (
          <p className="text-destructive mt-1 text-xs">
            {errors.amount.message}
          </p>
        ) : null}
      </label>

      <label className="block text-sm font-medium">
        Reason
        <textarea
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          rows={4}
          {...register("reason")}
          aria-invalid={Boolean(errors.reason)}
        />
        {errors.reason ? (
          <p className="text-destructive mt-1 text-xs">
            {errors.reason.message}
          </p>
        ) : null}
      </label>

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
