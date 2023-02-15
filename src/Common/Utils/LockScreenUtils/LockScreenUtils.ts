import { AppLockStatus } from "~Common/Hooks"
import { WalletSecurity } from "~Common/Hooks"

const isLockScreenFlow = (
    appLockStatus: AppLockStatus | undefined,
    walletSecurity: WalletSecurity,
) => {
    return (
        appLockStatus === AppLockStatus.LOCKED_STATE &&
        walletSecurity === WalletSecurity.PASS_UNLOCK
    )
}
const isBiometricLockFlow = (
    appLockStatus: AppLockStatus | undefined,
    walletSecurity: WalletSecurity,
) => {
    return (
        appLockStatus === AppLockStatus.LOCKED_STATE &&
        walletSecurity === WalletSecurity.BIO_UNLOCK
    )
}

export default {
    isLockScreenFlow,
    isBiometricLockFlow,
}
