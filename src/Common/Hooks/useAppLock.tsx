import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import { AppLock, useRealm } from "~Storage"
import {
    useAppLockEntity,
    useConfigEntity,
    useUserPreferencesEntity,
} from "./Entities"

export const useAppLock = () => {
    const { cache } = useRealm()
    const { appLockStatus: _appLockStatus } = useAppLockEntity()
    const appLock = cache.objectForPrimaryKey<AppLock>(
        AppLock.getName(),
        AppLock.getPrimaryKey(),
    )
    const { isWalletCreated } = useConfigEntity()
    const { isAppLockActive } = useUserPreferencesEntity()

    const appLockStatus = useMemo(() => {
        if (!isWalletCreated || !isAppLockActive) {
            return WALLET_STATUS.NOT_INITIALISED
        }

        if (isAppLockActive && _appLockStatus === "LOCKED") {
            return WALLET_STATUS.LOCKED
        }
    }, [_appLockStatus, isAppLockActive, isWalletCreated])

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
