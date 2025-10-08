export type RequestStatus = "draft" | "submitted" | "approved" | "rejected";

export interface RequestSummary {
  id: string;
  title: string;
  status: RequestStatus;
  submittedAt: string;
  amount?: number;
}
