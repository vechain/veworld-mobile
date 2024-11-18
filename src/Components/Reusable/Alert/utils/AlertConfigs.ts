export type AlertStatus = "success" | "error" | "info"

export enum StatusColorVariant {
    "success" = "successVariant",
    "error" = "errorVariant",
    "info" = "infoVariant",
}

export const ICON_NAMES: Record<AlertStatus, string> = {
    success: "check-circle-outline",
    error: "alert-outline",
    info: "information-outline",
}
