import { useMemo } from "react"
import { useConfigEntity } from "./Entities"

export const useAppInitState = () => {
    const configEntity = useConfigEntity()

    const isWalletCreated = useMemo(
        () => configEntity?.isWalletCreated,
        [configEntity],
    )

    const isResettingApp = useMemo(
        () => configEntity?.isResettingApp,
        [configEntity],
    )

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
