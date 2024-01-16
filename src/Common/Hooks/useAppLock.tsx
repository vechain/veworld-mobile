import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectAppLockStatus,
    selectHasOnboarded,
    selectIsAppLockActive,
} from "~Storage/Redux/Selectors"
import { setAppLockStatus } from "~Storage/Redux/Actions"

export const useAppLock = () => {
    const dispatch = useAppDispatch()

    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const _appLockStatus = useAppSelector(selectAppLockStatus)
    const isAppLockActive = useAppSelector(selectIsAppLockActive)

    const appLockStatusInactive = useMemo(
        () => !userHasOnboarded || !isAppLockActive,
        [userHasOnboarded, isAppLockActive],
    )

    const appLockStatusActive = useMemo(
        () =>
            isAppLockActive &&
            _appLockStatus === WALLET_STATUS.LOCKED &&
            userHasOnboarded,
        [isAppLockActive, _appLockStatus, userHasOnboarded],
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
