export type AutomationSkipReason = "inactive" | "not_configured";

export type AutomationDispatchResult =
  | { status: "dispatched" }
  | { status: "skipped"; reason: AutomationSkipReason };

export type AutomationBulkDispatchResult = {
  dispatched: number;
  skipped: number;
};
