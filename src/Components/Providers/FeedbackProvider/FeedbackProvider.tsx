import EventEmitter from "events"
import React, { useCallback, useEffect, useState } from "react"
import { FeedbackChip } from "./Components/FeedbackChip"
import { FeedbackShowArgs, FeedbackType } from "./Model"

export const FeedbackEmitter = new EventEmitter()

export const Feedback = {
    show: (args: FeedbackShowArgs) => {
        FeedbackEmitter.emit("show", args)
    },
}

export const FeedbackProvider = ({ children }: { children: React.ReactNode }) => {
    const [show, setShow] = useState(false)
    const [feedbackData, setFeedbackData] = useState<FeedbackShowArgs | null>(null)

    const onDismiss = useCallback(() => {
        setShow(false)
        setFeedbackData(null)
    }, [])

    useEffect(() => {
        FeedbackEmitter.on("show", (args: FeedbackShowArgs) => {
            if (show && feedbackData) return
            setShow(true)
            setFeedbackData(args)
        })

        return () => {
            FeedbackEmitter.removeAllListeners()
        }
    }, [show, feedbackData])

    useEffect(() => {
        let timeout: NodeJS.Timeout | null = null
        if (show) {
            if (feedbackData?.type === FeedbackType.ALERT) {
                timeout = setTimeout(() => {
                    onDismiss()
                }, feedbackData?.duration || 2000)
            }
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [show, feedbackData?.type, feedbackData?.duration, onDismiss])

    return (
        <>
            {children}
            <FeedbackChip show={show} feedbackData={feedbackData} onDismiss={onDismiss} />
        </>
    )
}
