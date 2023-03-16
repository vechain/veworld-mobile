import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import { UserPreferences, useRealm } from "~Storage"
import { useAppLockEntity } from "./Entities"
import { useConfigEntity } from "~Components"

export const useAppLock = () => {
    const { cache, store } = useRealm()
    const appLockEntity = useAppLockEntity()
    const configEntity = useConfigEntity()

    const usePref = store.objectForPrimaryKey<UserPreferences>(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
    )

    const isWalletCreated = useMemo(
        () => configEntity?.isWalletCreated,
        [configEntity],
    )

    const _appLockStatus = useMemo(
        () => appLockEntity?.status,
        [appLockEntity?.status],
    )

    const appLockStatus = useMemo(() => {
        if (!isWalletCreated || !usePref?.isAppLockActive) {
            return WALLET_STATUS.NOT_INITIALISED
        }

        if (usePref.isAppLockActive && _appLockStatus === "LOCKED") {
            return WALLET_STATUS.LOCKED
        }
    }, [_appLockStatus, isWalletCreated, usePref?.isAppLockActive])

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
