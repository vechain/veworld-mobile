import EventEmitter from "events"
import { FeedbackShowArgs } from "../Model"

export const FeedbackEmitter = new EventEmitter()

export const Feedback = {
    show: (args: FeedbackShowArgs) => {
        FeedbackEmitter.emit("show", args)
    },
}
