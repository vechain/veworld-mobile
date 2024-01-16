import { useMemo } from "react"
import { UserSelectedSecurityLevel } from "~Model"
import { useBiometrics } from "./useBiometrics"
import { useAppSelector } from "~Storage/Redux"
import { selectUserSelectedSecurity } from "~Storage/Redux/Selectors"

enum WalletSecurity {
    NONE = "NONE",
    BIO_UNLOCK = "BIO_UNLOCK",
    PASS_UNLOCK = "PASS_UNLOCK",
}

export const useWalletSecurity = () => {
    const userSelectedSecurity = useAppSelector(selectUserSelectedSecurity)
    const biometrics = useBiometrics()

    const walletSecurity = useMemo(() => {
        if (
            biometrics.accessControl &&
            userSelectedSecurity === UserSelectedSecurityLevel.BIOMETRIC
        ) {
            return WalletSecurity.BIO_UNLOCK
        }

        if (userSelectedSecurity === UserSelectedSecurityLevel.PASSWORD) {
            return WalletSecurity.PASS_UNLOCK
        }

        return WalletSecurity.NONE
    }, [biometrics.accessControl, userSelectedSecurity])

    const isWalletSecurityBiometrics = useMemo(
        () => walletSecurity === WalletSecurity.BIO_UNLOCK,
        [walletSecurity],
    )

    const isWalletSecurityPassword = useMemo(
        () => walletSecurity === WalletSecurity.PASS_UNLOCK,
        [walletSecurity],
    )

    const isWalletSecurityNone = useMemo(
        () => walletSecurity === WalletSecurity.NONE,
        [walletSecurity],
    )

    return {
        isWalletSecurityBiometrics,
        isWalletSecurityPassword,
        isWalletSecurityNone,
    }
}
