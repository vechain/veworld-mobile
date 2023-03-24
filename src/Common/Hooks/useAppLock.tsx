import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import { getUserPreferences, useRealm } from "~Storage"
import { useAppLockEntity } from "./Entities"
import { useAppSelector } from "~Storage/Redux"
import { selectIsWalletCreated } from "~Storage/Redux/Selectors"

export const useAppLock = () => {
    const { cache, store } = useRealm()
    const appLockEntity = useAppLockEntity()

    const userPreferences = getUserPreferences(store)

    const isWalletCreated = useAppSelector(selectIsWalletCreated)

    const _appLockStatus = useMemo(
        () => appLockEntity?.status,
        [appLockEntity?.status],
    )

    const appLockStatus = useMemo(() => {
        if (!isWalletCreated || !userPreferences.isAppLockActive) {
            return WALLET_STATUS.NOT_INITIALISED
        }

        if (userPreferences.isAppLockActive && _appLockStatus === "LOCKED") {
            return WALLET_STATUS.LOCKED
        }
    }, [_appLockStatus, isWalletCreated, userPreferences.isAppLockActive])

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
