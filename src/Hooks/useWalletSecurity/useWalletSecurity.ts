import { useMemo } from "react"
import { SecurityLevelType } from "~Model"
import { useBiometrics } from "../useBiometrics"
import { useApplicationSecurity } from "~Components/Providers"

enum WalletSecurity {
    NONE = "NONE",
    BIO_UNLOCK = "BIO_UNLOCK",
    PASS_UNLOCK = "PASS_UNLOCK",
}

/**
 * hook with the logic to determine the wallet security level and some helper functions
 */
export const useWalletSecurity = () => {
    const { securityType } = useApplicationSecurity()
    const biometrics = useBiometrics()

    const walletSecurity = useMemo(() => {
        if (biometrics?.accessControl && securityType === SecurityLevelType.BIOMETRIC) {
            return WalletSecurity.BIO_UNLOCK
        }

        if (securityType === SecurityLevelType.SECRET) {
            return WalletSecurity.PASS_UNLOCK
        }

        return WalletSecurity.NONE
    }, [biometrics?.accessControl, securityType])

    const isWalletSecurityBiometrics = useMemo(() => walletSecurity === WalletSecurity.BIO_UNLOCK, [walletSecurity])

    const isWalletSecurityPassword = useMemo(() => walletSecurity === WalletSecurity.PASS_UNLOCK, [walletSecurity])

    const isWalletSecurityNone = useMemo(() => walletSecurity === WalletSecurity.NONE, [walletSecurity])

    return {
        isWalletSecurityBiometrics,
        isWalletSecurityPassword,
        isWalletSecurityNone,
        biometrics,
    }
}
