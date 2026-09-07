import "server-only";

export { SettingsService, getSettingsService } from "./service";
export { toPublicSettings } from "./public";
export { validateSettingsPatch } from "./validate";
export {
  AUTOMATION_CATALOG,
  resolveAutomationAction,
  sourceLabel,
} from "./catalog";
export type {
  AutomationAction,
  IntegrationConnectionState,
  IntegrationId,
  PublicSettings,
  SettingsPatch,
} from "./types";
