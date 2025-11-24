import React, { useCallback, useEffect, useState } from "react"
import { FeedbackChip } from "./Components/FeedbackChip"
import { FeedbackEmitter } from "./Events"
import { FeedbackShowArgs, FeedbackType } from "./Model"

export const FeedbackProvider = ({ children }: { children: React.ReactNode }) => {
    const [feedbackData, setFeedbackData] = useState<FeedbackShowArgs | null>(null)

    const onDismiss = useCallback(() => {
        setFeedbackData(null)
    }, [])

    useEffect(() => {
        FeedbackEmitter.on("show", (args: FeedbackShowArgs) => {
            if (feedbackData && !feedbackData.id) return
            if (feedbackData && feedbackData.id && feedbackData.id !== args.id) return
            setFeedbackData(args)
        })

        return () => {
            FeedbackEmitter.removeAllListeners()
        }
    }, [feedbackData])

    useEffect(() => {
        let timeout: NodeJS.Timeout | null = null
        if (feedbackData?.type === FeedbackType.ALERT) {
            timeout = setTimeout(() => {
                onDismiss()
            }, feedbackData.duration || 3000)
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
