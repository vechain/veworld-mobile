import { IconKey } from "~Model"

export type AlertStatus = "success" | "error" | "info" | "neutral"

export enum StatusColorVariant {
    "success" = "successVariant",
    "error" = "errorVariant",
    "info" = "infoVariant",
    "neutral" = "neutralVariant",
}

export const ICON_NAMES: Record<AlertStatus, IconKey> = {
    success: "icon-check-circle-2",
    error: "icon-alert-triangle",
    info: "icon-info",
    neutral: "icon-info",
}
