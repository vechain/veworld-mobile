import EventEmitter from "events"
import React, { useEffect, useState } from "react"
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

    useEffect(() => {
        FeedbackEmitter.on("show", (args: FeedbackShowArgs) => {
            if (show) return
            setShow(true)
            setFeedbackData(args)
        })

        return () => {
            FeedbackEmitter.removeAllListeners()
        }
    }, [show])

    useEffect(() => {
        let timeout: NodeJS.Timeout | null = null
        if (show) {
            if (feedbackData?.type === FeedbackType.ALERT) {
                timeout = setTimeout(() => {
                    setShow(false)
                    setFeedbackData(null)
                }, 2000)
            }
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [show, feedbackData?.type])

    return (
        <>
            {children}
            <FeedbackChip
                show={show}
                feedbackData={feedbackData}
                onHide={() => {
                    setShow(false)
                    setFeedbackData(null)
                }}
            />
        </>
    )
}
