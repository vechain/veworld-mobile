import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectAppLockStatus,
    selectHasOnboarded,
} from "~Storage/Redux/Selectors"
import { setAppLockStatus } from "~Storage/Redux/Actions"

/**
 * hook to handle app lock
 */
export const useAppLock = () => {
    const dispatch = useAppDispatch()

    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const _appLockStatus = useAppSelector(selectAppLockStatus)

    const appLockStatusInactive = useMemo(
        () => !userHasOnboarded,
        [userHasOnboarded],
    )

    const appLockStatusActive = useMemo(
        () => _appLockStatus === WALLET_STATUS.LOCKED && userHasOnboarded,
        [_appLockStatus, userHasOnboarded],
    )

    const unlockApp = useCallback(() => {
        dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))
    }, [dispatch])

    const lockApp = useCallback(() => {
        dispatch(setAppLockStatus(WALLET_STATUS.LOCKED))
    }, [dispatch])

    return {
        lockApp,
        unlockApp,
        appLockStatusInactive,
        appLockStatusActive,
    }
}
