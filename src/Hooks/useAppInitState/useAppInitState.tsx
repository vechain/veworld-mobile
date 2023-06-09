import { useMemo } from "react"
import { useAppSelector } from "~Storage/Redux"
import { selectHasOnboarded } from "~Storage/Redux/Selectors"

/**
 * return the current app status
 */
export const useAppInitState = () => {
    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const appStatus = useMemo(() => {
        if (!userHasOnboarded) return AppInitState.INIT_STATE
        return AppInitState.ONBOARDED_STATE
    }, [userHasOnboarded])

    return appStatus
}

export enum AppInitState {
    INIT_STATE = "INIT_STATE",
    ONBOARDED_STATE = "ONBOARDED_STATE",
}
