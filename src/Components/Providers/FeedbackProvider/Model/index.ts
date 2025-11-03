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
    /**
     * The severity of the feedback.
     */
    severity: FeedbackSeverity
    /**
     * The type of the feedback.
     * If the severity is `FeedbackSeverity.LOADING`, the type will be ignored and the feedback will be permanent.
     *
     * @default FeedbackType.ALERT
     */
    type: FeedbackType
    /**
     * The message of the feedback.
     */
    message: string
    icon?: IconKey
    duration?: number
}
