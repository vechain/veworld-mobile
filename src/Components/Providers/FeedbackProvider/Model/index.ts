import { IconKey } from "~Model"

export enum FeedbackSeverity {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error",
    LOADING = "loading",
}

export enum FeedbackType {
    ALERT = "alert",
    PERMANENT = "permanent",
}

export type FeedbackShowArgs = {
    severity: FeedbackSeverity
    type: FeedbackType
    icon?: IconKey
    message: string
}
