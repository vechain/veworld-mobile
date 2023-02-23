import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import {
    AppLock,
    Config,
    useCache,
    useCachedObject,
    useStoreObject,
} from "~Storage"

export const useAppLock = () => {
    const cache = useCache()

    const config = useStoreObject<Config>(Config.getName(), Config.PrimaryKey())
    const appLock = useCachedObject<AppLock>(
        AppLock.getName(),
        AppLock.PrimaryKey(),
    )

    const appLockStatus = useMemo(() => {
        if (!config?.isWalletCreated || !config?.isAppLockActive) {
            return WALLET_STATUS.NOT_INITIALISED
        }

        if (config?.isAppLockActive && appLock?.status === "LOCKED") {
            return WALLET_STATUS.LOCKED
        }
    }, [appLock, config])

    const unlockApp = useCallback(() => {
        if (appLock) {
            cache.write(() => {
                appLock.status = WALLET_STATUS.UNLOCKED
            })
        }
    }, [cache, appLock])

    const lockApp = useCallback(() => {
        if (appLock) {
            cache.write(() => {
                appLock.status = WALLET_STATUS.LOCKED
            })
        }
    }, [cache, appLock])

    return { appLockStatus, lockApp, unlockApp }
}
