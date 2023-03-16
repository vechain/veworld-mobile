import { useMemo } from "react"
import { UserSelectedSecurityLevel } from "~Model"
import { useBiometrics } from "./useBiometrics"
import { useConfigEntity } from "~Components"

export const useWalletSecurity = () => {
    const configEntity = useConfigEntity()

    const userSelectedSecurity = useMemo(
        () => configEntity?.userSelectedSecurity,
        [configEntity?.userSelectedSecurity],
    )

    const isSecurityDowngrade = useMemo(
        () => configEntity?.isSecurityDowngrade,
        [configEntity],
    )

    const biometrics = useBiometrics()

    const isBiometricsEnabled = useMemo(
        () => biometrics?.accessControl,
        [biometrics],
    )

    const walletSecurity = useMemo(() => {
        if (
            isBiometricsEnabled &&
            userSelectedSecurity === UserSelectedSecurityLevel.BIOMETRIC
        ) {
            return WalletSecurity.BIO_UNLOCK
        }

        if (userSelectedSecurity === UserSelectedSecurityLevel.PASSWORD) {
            return WalletSecurity.PASS_UNLOCK
        }

        return WalletSecurity.NONE
    }, [isBiometricsEnabled, userSelectedSecurity])

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
        isBiometricsEnabled,
        walletSecurity,
        isWalletSecurityBiometrics,
        isWalletSecurityPassword,
        isWalletSecurityNone,
        isSecurityDowngrade,
    }
}

export enum WalletSecurity {
    NONE = "NONE",
    BIO_UNLOCK = "BIO_UNLOCK",
    PASS_UNLOCK = "PASS_UNLOCK",
}
