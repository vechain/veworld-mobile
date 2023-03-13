import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import { useRealm } from "~Storage"
import {
    useAppLockEntity,
    useConfigEntity,
    useUserPreferencesEntity,
} from "./Entities"

export const useAppLock = () => {
    const { cache } = useRealm()
    const { appLockEntity, appLockStatus: _appLockStatus } = useAppLockEntity()
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
        if (appLockEntity) {
            cache.write(() => {
                appLockEntity.status = WALLET_STATUS.UNLOCKED
            })
        }
    }, [cache, appLockEntity])

    const lockApp = useCallback(() => {
        if (appLockEntity) {
            cache.write(() => {
                appLockEntity.status = WALLET_STATUS.LOCKED
            })
        }
    }, [cache, appLockEntity])

    return { appLockStatus, lockApp, unlockApp }
}
