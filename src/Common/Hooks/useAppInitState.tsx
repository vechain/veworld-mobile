import { useMemo } from "react"
import { useAppSelector } from "~Storage/Redux"
import {
    selectIsResettingApp,
    selectHasOnboarded,
} from "~Storage/Redux/Selectors"

export const useAppInitState = () => {
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const isResettingApp = useAppSelector(selectIsResettingApp)

    const appStatus = useMemo(() => {
        if (isResettingApp) return AppInitState.RESETTING_STATE
        if (!userHasOnboarded) return AppInitState.INIT_STATE
    }, [isResettingApp, userHasOnboarded])

    return appStatus
}

export enum AppInitState {
    INIT_STATE = "INIT_STATE",
    RESETTING_STATE = "RESETTING_STATE",
}
