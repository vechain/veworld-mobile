/* eslint-disable max-len */

// NOTE:
// Trace - Only when I would be "tracing" the code and trying to find one part of a function specifically.
// Debug - Information that is diagnostically helpful to people more than just developers (IT, sysadmins, etc.).
// Info - Generally useful information to log (service start/stop, configuration assumptions, etc). Info I want to always have available but usually don't care about under normal circumstances. This is my out-of-the-box config level.
// Warn - Anything that can potentially cause application oddities, but for which I am automatically recovering. (Such as switching from a primary to backup server, retrying an operation, missing secondary data, etc.)
// Error - Any error

const logLevel = process.env.REACT_APP_LOG_LEVEL || "warn"
import * as Sentry from "@sentry/react-native"
import { ERROR_EVENTS } from "~Constants"

const LOG_LEVELS = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
}

type LogLevelKey = keyof typeof LOG_LEVELS
type ErrorEventKey = keyof typeof ERROR_EVENTS

const checkLogLevelHOC = (logID: LogLevelKey): ((eventKey: ErrorEventKey, ...args: unknown[]) => void) => {
    return (eventKey, ...args) => {
        if (LOG_LEVELS[logID] === LOG_LEVELS.error) {
            // eslint-disable-next-line no-console
            console.error(`[-- ${ERROR_EVENTS[eventKey]} --]`, ...args)

            const concatenatedString = args.reduce((accumulator, currentValue) => {
                return accumulator + currentValue!.toString()
            }, "")

            try {
                Sentry.captureException(concatenatedString, { tags: { Feature_Tag: ERROR_EVENTS[eventKey] } })
            } catch {
                Sentry.captureException(args)
            }
        } else if (LOG_LEVELS[logID] >= LOG_LEVELS[logLevel as LogLevelKey]) {
            // eslint-disable-next-line no-console
            console[logID](`[-- ${ERROR_EVENTS[eventKey]} --]`, ...args)
        }
    }
}

export const trace = checkLogLevelHOC("trace")
export const debug = checkLogLevelHOC("debug")
export const info = checkLogLevelHOC("info")
export const warn = checkLogLevelHOC("warn")
export const error = checkLogLevelHOC("error")
