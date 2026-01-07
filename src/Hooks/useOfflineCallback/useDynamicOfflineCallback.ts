import { useCallback } from "react"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useIsOnline } from "~Hooks/useIsOnline"
import { useI18nContext } from "~i18n"

/**
 * Raw variant of `useOfflineCallback`. Use this function only when you need to offline execute a quick function in a set of functions
 * @returns A function that you can call with your dynamic function
 */
export const useDynamicOfflineCallback = () => {
    const { LL } = useI18nContext()
    const isOnline = useIsOnline()
    return useCallback(
        <TReturn>(cb: () => TReturn): TReturn | undefined => {
            if (!isOnline) {
                Feedback.show({
                    message: LL.OFFLINE_CHIP(),
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                })
                return
            }
            return cb()
        },
        [LL, isOnline],
    )
}
