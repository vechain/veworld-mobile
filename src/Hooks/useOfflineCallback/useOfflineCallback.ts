import { useCallback } from "react"
import { useDynamicOfflineCallback } from "./useDynamicOfflineCallback"

export const useOfflineCallback = <TArgs extends unknown[], TReturn>(
    cb: (...args: TArgs) => TReturn,
): ((...args: TArgs) => TReturn | undefined) => {
    const execute = useDynamicOfflineCallback()
    return useCallback(
        (...args: TArgs) => {
            return execute(() => cb(...args))
        },
        [cb, execute],
    )
}
