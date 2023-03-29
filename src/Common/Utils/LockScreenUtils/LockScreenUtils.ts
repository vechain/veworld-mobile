import { WalletSecurity } from "~Common/Hooks"
import { WALLET_STATUS } from "~Model"

export const isLockScreenFlow = (
    appLockStatus: WALLET_STATUS | undefined,
    walletSecurity: WalletSecurity,
) => {
    return (
        appLockStatus === WALLET_STATUS.LOCKED &&
        walletSecurity === WalletSecurity.PASS_UNLOCK
    )
}
export const isBiometricLockFlow = (
    appLockStatus: WALLET_STATUS | undefined,
    walletSecurity: WalletSecurity,
) => {
    return (
        appLockStatus === WALLET_STATUS.LOCKED &&
        walletSecurity === WalletSecurity.BIO_UNLOCK
    )
}

export default {
    isLockScreenFlow,
    isBiometricLockFlow,
}
