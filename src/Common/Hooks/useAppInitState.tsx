import { useMemo } from "react"
import { Config, useObjectListener, useRealm } from "~Storage"

export const useAppInitState = () => {
    const { store } = useRealm()

    const config = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    const isWalletCreated = useMemo(() => config?.isWalletCreated, [config])

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
