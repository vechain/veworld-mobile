import { useMemo } from "react"
import { Config, useObjectListener, useRealm } from "~Storage"

export const useAppInitState = () => {
    const { store } = useRealm()
    const config = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    const appStatus = useMemo(() => {
        if (!config?.isWalletCreated) {
            return AppInitState.INIT_STATE
        }
    }, [config])

    return appStatus
}

export enum AppInitState {
    INIT_STATE = "INIT_STATE",
}
