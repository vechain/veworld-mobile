import { useMemo } from "react"
import { UserSelectedSecurityLevel } from "~Model"
import { Biometrics, Config, useObjectListener, useRealm } from "~Storage"

export const useWalletSecurity = () => {
    const { store, cache } = useRealm()

    const config = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    const biometrics = useObjectListener(
        Biometrics.getName(),
        Biometrics.getPrimaryKey(),
        cache,
    ) as Biometrics

    const isBiometricsEnabled = useMemo(
        () => biometrics?.accessControl,
        [biometrics],
    )

    const walletSecurity = useMemo(() => {
        if (
            isBiometricsEnabled &&
            config?.userSelectedSecurity === UserSelectedSecurityLevel.BIOMETRIC
        ) {
            return WalletSecurity.BIO_UNLOCK
        }

        if (
            config?.userSelectedSecurity === UserSelectedSecurityLevel.PASSWORD
        ) {
            return WalletSecurity.PASS_UNLOCK
        }

        return WalletSecurity.NONE
    }, [config, isBiometricsEnabled])

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

    const isSecurityDowngrade = useMemo(
        () => config?.isSecurityDowngrade,
        [config],
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
