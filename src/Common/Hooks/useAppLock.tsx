import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import { useConfig, useRealm, useAppLock } from "~Storage"

export const useAppLockStatus = () => {
    const { cache } = useRealm()

    const config = useConfig()
    const appLock = useAppLock()

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
