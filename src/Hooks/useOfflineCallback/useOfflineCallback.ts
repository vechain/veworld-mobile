import { useNetInfo } from "@react-native-community/netinfo"
import { useCallback } from "react"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useI18nContext } from "~i18n"

export const useOfflineCallback = <TFunction extends (...args: any[]) => any>(cb: TFunction) => {
    const { LL } = useI18nContext()
    const { isConnected } = useNetInfo()
    return useCallback(
        (...args: Parameters<TFunction>) => {
            if (!isConnected) {
                Feedback.show({
                    message: LL.OFFLINE_CHIP(),
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                })
                return
            }
            return cb(...args)
        },
        [LL, cb, isConnected],
    )
}
