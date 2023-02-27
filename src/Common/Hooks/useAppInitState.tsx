import { useMemo } from "react"
import { useConfigEntity } from "./Entities"

export const useAppInitState = () => {
    const { configEntity } = useConfigEntity()

    const isWalletCreated = useMemo(
        () => configEntity?.isWalletCreated,
        [configEntity],
    )

    const appStatus = useMemo(() => {
        if (!isWalletCreated) {
            return AppInitState.INIT_STATE
        }
    }, [isWalletCreated])

    return appStatus
}

export enum AppInitState {
    INIT_STATE = "INIT_STATE",
}
