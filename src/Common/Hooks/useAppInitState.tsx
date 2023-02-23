import { useMemo } from "react"
import { Config, useStoreObject } from "~Storage"

export const useAppInitState = () => {
    const config = useStoreObject<Config>(Config.getName(), Config.PrimaryKey())

    console.log("config", config)

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
