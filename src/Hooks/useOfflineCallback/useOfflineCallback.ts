import { useCallback } from "react"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useIsOnline } from "~Hooks/useIsOnline"
import { useI18nContext } from "~i18n"

export const useOfflineCallback = <TFunction extends (...args: readonly unknown[]) => unknown>(cb: TFunction) => {
    const { LL } = useI18nContext()
    const isOnline = useIsOnline()
    return useCallback(
        (...args: Parameters<TFunction>) => {
            if (!isOnline) {
                Feedback.show({
                    message: LL.OFFLINE_CHIP(),
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                })
                return
            }
            return cb(...args)
        },
        [LL, cb, isOnline],
    )
}
