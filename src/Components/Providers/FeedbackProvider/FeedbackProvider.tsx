import EventEmitter from "events"
import React, { useCallback, useEffect, useState } from "react"
import { FeedbackChip } from "./Components/FeedbackChip"
import { FeedbackSeverity, FeedbackShowArgs, FeedbackType } from "./Model"

export const FeedbackEmitter = new EventEmitter()

export const Feedback = {
    show: (args: FeedbackShowArgs) => {
        FeedbackEmitter.emit("show", args)
    },
}

export const FeedbackProvider = ({ children }: { children: React.ReactNode }) => {
    const [feedbackData, setFeedbackData] = useState<FeedbackShowArgs | null>(null)

    const onDismiss = useCallback(() => {
        setFeedbackData(null)
    }, [])

    useEffect(() => {
        FeedbackEmitter.on("show", (args: FeedbackShowArgs) => {
            if (feedbackData) return
            setFeedbackData(args)
        })

        return () => {
            FeedbackEmitter.removeAllListeners()
        }
    }, [feedbackData])

    useEffect(() => {
        let timeout: NodeJS.Timeout | null = null
        if (feedbackData) {
            if (feedbackData.type === FeedbackType.ALERT && feedbackData.severity !== FeedbackSeverity.LOADING) {
                timeout = setTimeout(() => {
                    onDismiss()
                }, feedbackData.duration || 2000)
            }
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [onDismiss, feedbackData])

    return (
        <>
            {children}
            <FeedbackChip feedbackData={feedbackData} onDismiss={onDismiss} />
        </>
    )
}
