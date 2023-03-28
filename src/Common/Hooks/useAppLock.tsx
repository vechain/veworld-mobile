import { useCallback, useMemo } from "react"
import { WALLET_STATUS } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    getAppLockStatus,
    hasOnboarded,
    selectIsAppLockActive,
} from "~Storage/Redux/Selectors"
import { setAppLockStatus } from "~Storage/Redux/Actions"

export const useAppLock = () => {
    const dispatch = useAppDispatch()

    const userHasOnboarded = useAppSelector(hasOnboarded)
    const _appLockStatus = useAppSelector(getAppLockStatus)
    const isAppLockActive = useAppSelector(selectIsAppLockActive)

    const appLockStatus = useMemo(() => {
        if (!userHasOnboarded || !isAppLockActive) {
            return WALLET_STATUS.NOT_INITIALISED
        }

        if (isAppLockActive && _appLockStatus === WALLET_STATUS.LOCKED) {
            return WALLET_STATUS.LOCKED
        }
    }, [_appLockStatus, userHasOnboarded, isAppLockActive])

    const unlockApp = useCallback(() => {
        dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))
    }, [dispatch])

    const lockApp = useCallback(() => {
        dispatch(setAppLockStatus(WALLET_STATUS.LOCKED))
    }, [dispatch])

    return { appLockStatus, lockApp, unlockApp }
}
