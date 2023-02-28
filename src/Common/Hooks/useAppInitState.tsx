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
        if (isResettingApp) return AppInitState.RESET_SATE
        if (!isWalletCreated) return AppInitState.INIT_STATE
    }, [isResettingApp, isWalletCreated])

    return appStatus
}

export enum AppInitState {
    INIT_STATE = "INIT_STATE",
    RESET_SATE = "RESET_SATE",
}
