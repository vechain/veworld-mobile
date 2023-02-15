import { useCallback, useMemo } from "react"
import { CryptoUtils, PasswordUtils } from "~Common/Utils"
import { UserSelectedSecurityLevel, Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import {
    Biometrics,
    Config,
    Device,
    useCache,
    useCachedQuery,
    useStore,
    useStoreQuery,
} from "~Storage"

export const useWalletSecurity = () => {
    const store = useStore()
    const cache = useCache()

    const configQuery = useStoreQuery(Config)
    const config = useMemo(() => configQuery.sorted("_id"), [configQuery])

    const biometricsQuery = useCachedQuery(Biometrics)
    const biometrics = useMemo(
        () => biometricsQuery.sorted("_id"),
        [biometricsQuery],
    )

    const deviceQuery = useStoreQuery(Device)
    const devices = useMemo(
        () => deviceQuery.sorted("rootAddress"),
        [deviceQuery],
    )

    const isBiometricsEnabled = useMemo(
        () => biometrics[0]?.accessControl,
        [biometrics],
    )

    const walletSecurity = useMemo(() => {
        if (
            isBiometricsEnabled &&
            config[0]?.userSelectedSecurtiy ===
                UserSelectedSecurityLevel.BIOMETRIC
        ) {
            return WalletSecurity.BIO_UNLOCK
        }

        if (
            config[0]?.userSelectedSecurtiy ===
            UserSelectedSecurityLevel.PASSWORD
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
        () => config[0]?.isSecurityDowngrade,
        [config],
    )

    /**
     * upgrade security level from password to biometrics, reencrypting the wallets
     */
    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (walletSecurity === WalletSecurity.BIO_UNLOCK) return

            store.beginTransaction()

            for (const device of devices) {
                let encryptedKey = await KeychainService.getEncryptionKey(
                    device.index,
                    false,
                )
                if (encryptedKey) {
                    const decryptedKey = CryptoUtils.decrypt<string>(
                        encryptedKey,
                        PasswordUtils.hash(password),
                    )
                    let _wallet = CryptoUtils.decrypt<Wallet>(
                        device.wallet,
                        decryptedKey,
                    )

                    const { encryptedWallet: updatedEncryptedWallet } =
                        await CryptoUtils.encryptWallet(
                            _wallet,
                            device.index,
                            true,
                        )

                    device.wallet = updatedEncryptedWallet
                } else {
                    console.log(`No key for ${device.alias}`)
                }
            }
            config[0].userSelectedSecurtiy = UserSelectedSecurityLevel.BIOMETRIC
            store.commitTransaction()
            cache.write(() => (biometrics[0].accessControl = true))
            onSuccessCallback && onSuccessCallback()
        },
        [store, cache, config, biometrics, devices, walletSecurity],
    )

    return {
        isBiometricsEnabled,
        walletSecurity,
        isWalletSecurityBiometrics,
        isWalletSecurityPassword,
        isWalletSecurityNone,
        isSecurityDowngrade,
        runSecurityUpgrade,
    }
}

export enum WalletSecurity {
    NONE = "NONE",
    BIO_UNLOCK = "BIO_UNLOCK",
    PASS_UNLOCK = "PASS_UNLOCK",
}
