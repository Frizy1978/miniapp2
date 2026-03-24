import type { BatchStatus } from "../enums";

export type CurrentBatchDto = {
  id: string;
  code: string;
  status: BatchStatus;
  closesAt: string | null;
  deliveryAt: string | null;
  customerMessage: string | null;
} | null;
