import { useMemo } from "react"
import { useConfig } from "~Storage/Realm/Context/ConfigContext"

export const useAppInitState = () => {
    const config = useConfig()

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
