export type AlertStatus = "success" | "error" | "info"

export const ICON_NAMES: Record<AlertStatus, string> = {
    success: "check-circle-outline",
    error: "alert-outline",
    info: "information-outline",
}
