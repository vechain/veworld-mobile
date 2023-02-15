import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import {
    AppLock,
    Config,
    Device,
    useCache,
    useCachedQuery,
    useStoreQuery,
} from "~Storage"

export const useAppInitState = () => {
    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Config)
    const config = useMemo(() => result1.sorted("_id"), [result1])

    const appStatus = useMemo(() => {
        if (!config[0]?.isWalletCreated) {
            return AppInitState.INIT_STATE
        }
    }, [config])

    return appStatus
}

export const useAppLock = () => {
    const cache = useCache()
    // todo: this is a workaround until the new version is installed
    const result = useStoreQuery(Device)
    const devices = useMemo(() => result.sorted("rootAddress"), [result])

    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Config)
    const config = useMemo(() => result1.sorted("_id"), [result1])

    // todo: this is a workaround until the new version is installed
    const result2 = useCachedQuery(AppLock)
    const appLock = useMemo(() => result2.sorted("_id"), [result2])

    const appLockStatus = useMemo(() => {
        if (!devices.length || !config[0].isAppLockActive) {
            return AppLockStatus.NO_LOCK
        }

        if (config[0].isAppLockActive && appLock[0]?.status === "LOCKED") {
            return AppLockStatus.LOCKED_STATE
        }
    }, [appLock, config, devices.length])

    const unlockApp = useCallback(() => {
        cache.write(() => {
            appLock[0].status = WALLET_STATUS.UNLOCKED
        })
    }, [cache, appLock])

    const lockApp = useCallback(() => {
        cache.write(() => {
            appLock[0].status = WALLET_STATUS.LOCKED
        })
    }, [cache, appLock])

    return { appLockStatus, lockApp, unlockApp }
}

export enum AppInitState {
    INIT_STATE = "INIT_STATE",
}

export enum AppLockStatus {
    NO_LOCK = "NO_LOCK",
    LOCKED_STATE = "LOCKED_STATE",
}
