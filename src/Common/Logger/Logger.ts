// NOTE:
// Trace - Only when I would be "tracing" the code and trying to find one part of a function specifically.
// Debug - Information that is diagnostically helpful to people more than just developers (IT, sysadmins, etc.).
// Info - Generally useful information to log (service start/stop, configuration assumptions, etc). Info I want to always have available but usually don't care about under normal circumstances. This is my out-of-the-box config level.
// Warn - Anything that can potentially cause application oddities, but for which I am automatically recovering. (Such as switching from a primary to backup server, retrying an operation, missing secondary data, etc.)
// Error - Any error

const LOG_LEVELS = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
}
const logLevel = process.env.REACT_APP_LOG_LEVEL || "warn"

const checkLogLevelHOC = (
    logID: keyof typeof LOG_LEVELS,
): ((...args: unknown[]) => void) => {
    if (LOG_LEVELS[logID] >= LOG_LEVELS[logLevel as keyof typeof LOG_LEVELS]) {
        return console[logID]
    }
    return () => {}
}

export const trace = checkLogLevelHOC("trace")
export const debug = checkLogLevelHOC("debug")
export const info = checkLogLevelHOC("info")
export const warn = checkLogLevelHOC("warn")
export const error = checkLogLevelHOC("error")
