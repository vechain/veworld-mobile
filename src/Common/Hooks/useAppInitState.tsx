import { useMemo } from "react"
import { useAppSelector } from "~Storage/Redux"
import {
    selectIsResettingApp,
    selectIsWalletCreated,
} from "~Storage/Redux/Selectors"

export const useAppInitState = () => {
    const isWalletCreated = useAppSelector(selectIsWalletCreated)
    const isResettingApp = useAppSelector(selectIsResettingApp)

    const appStatus = useMemo(() => {
        if (isResettingApp) return AppInitState.RESETTING_STATE
        if (!isWalletCreated) return AppInitState.INIT_STATE
    }, [isResettingApp, isWalletCreated])

    return appStatus
}

export enum AppInitState {
    INIT_STATE = "INIT_STATE",
    RESETTING_STATE = "RESETTING_STATE",
}
