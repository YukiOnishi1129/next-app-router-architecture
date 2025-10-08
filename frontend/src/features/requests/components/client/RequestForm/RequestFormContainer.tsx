"use client";

import { useCallback } from "react";

import { createRequestAction } from "@/features/requests/actions";

import { RequestFormPresenter } from "./RequestFormPresenter";
import { useRequestForm } from "./useRequestForm";

import type { FormEvent } from "react";

export function RequestFormContainer() {
  const { form, handleSubmit } = useRequestForm();

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      handleSubmit(event, async (input) => {
        await createRequestAction(input);
      });
    },
    [handleSubmit]
  );

  return <RequestFormPresenter form={form} onSubmit={onSubmit} />;
}
