import { IconKey } from "~Model"

export type AlertStatus = "success" | "error" | "info"

export enum StatusColorVariant {
    "success" = "successVariant",
    "error" = "errorVariant",
    "info" = "infoVariant",
}

export const ICON_NAMES: Record<AlertStatus, IconKey> = {
    success: "icon-check-circle-2",
    error: "icon-alert-triangle",
    info: "icon-info",
}
