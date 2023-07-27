import { useCallback } from "react"
import { AnalyticsEvent } from "~Constants"
import { useAppDispatch } from "~Storage/Redux"
import { AnalyticsUtils } from "~Utils"
import { AnalyticsProperties } from "~Utils/AnalyticsUtils"

export const useAnalyticTracking = () => {
    const dispatch = useAppDispatch()

    return useCallback(
        (event: AnalyticsEvent, data?: AnalyticsProperties) => {
            dispatch(AnalyticsUtils.trackEvent(event, data))
        },
        [dispatch],
    )
}
