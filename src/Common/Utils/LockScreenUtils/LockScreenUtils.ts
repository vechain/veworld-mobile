import { AppLockStatus, AppUnlockFlow } from "~Common/Hooks"

const isLockScreenFlow = (
    appLockStatus: AppLockStatus | undefined,
    unlockFlow: AppUnlockFlow,
) => {
    return (
        appLockStatus === AppLockStatus.LOCKED_STATE &&
        unlockFlow === AppUnlockFlow.PASS_UNLOCK
    )
}
const isBiometricLockFlow = (
    appLockStatus: AppLockStatus | undefined,
    unlockFlow: AppUnlockFlow,
) => {
    return (
        appLockStatus === AppLockStatus.LOCKED_STATE &&
        unlockFlow === AppUnlockFlow.BIO_UNLOCK
    )
}

export default {
    isLockScreenFlow,
    isBiometricLockFlow,
}
