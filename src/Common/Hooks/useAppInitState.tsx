import { useMemo } from "react"
import { useConfigEntity } from "./Entities"

export const useAppInitState = () => {
    const { isWalletCreated, isResettingApp } = useConfigEntity()

    const appStatus = useMemo(() => {
        console.log({ isWalletCreated, isResettingApp }, "1")
        if (isResettingApp) return AppInitState.RESETTING_STATE
        console.log({ isWalletCreated, isResettingApp }, "2")
        if (!isWalletCreated) return AppInitState.INIT_STATE
        console.log({ isWalletCreated, isResettingApp }, "3")
    }, [isResettingApp, isWalletCreated])

    return appStatus
}

export enum AppInitState {
    INIT_STATE = "INIT_STATE",
    RESETTING_STATE = "RESETTING_STATE",
}
