'use client'

import type { RequestFilterInput } from "@/features/requests/types";
import { RequestListPresenter } from "./RequestListPresenter";
import { useRequestList } from "./useRequestList";

type RequestListContainerProps = {
  filters: RequestFilterInput;
};

export function RequestListContainer({ filters }: RequestListContainerProps) {
  const { data, isLoading } = useRequestList({ filters });

  return <RequestListPresenter requests={data} isLoading={isLoading} />;
}
