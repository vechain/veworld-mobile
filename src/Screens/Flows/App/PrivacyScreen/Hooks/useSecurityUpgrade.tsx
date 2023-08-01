import { useCallback } from "react"
import { useWalletSecurity } from "~Hooks"
import { LocalDevice } from "~Model"
import { CryptoUtils, debug, error } from "~Utils"
import { selectLocalDevices, useAppSelector } from "~Storage/Redux"
import {
    Operation,
    OperationType,
    useSecurityTransactions,
} from "./useSecurityTransactions"

/**
 * `useSecurityUpgrade` is a custom hook that orchestrates a security upgrade of a wallet.
 * This hook works by decrypting the wallet using the provided password and then re-encrypting it at the new security level.
 *
 * Note that if the current wallet security is biometric, this hook will not perform any operation.
 *
 * @returns {Function} runSecurityUpgrade - A function that can be invoked to trigger the security upgrade.
 * This function takes a password and an optional callback function as arguments.
 * The password is used to decrypt the wallet. The callback is invoked upon successful completion of the upgrade.
 *
 * @callback runSecurityUpgrade
 * @param {string} password - The password that will be used to decrypt the wallet.
 * @param {() => void} [onSuccessCallback] - An optional callback function that will be invoked when the security upgrade has successfully completed.
 *
 * @throws Will throw an error if the security upgrade process encounters any issues.
 *
 * @example
 * ```
 * const runSecurityUpgrade = useSecurityUpgrade();
 *
 * runSecurityUpgrade('password', () => {
 *   console.log("Security upgrade completed");
 * });
 * ```
 *
 * @requires `useWalletSecurity` hook for determining the current security state of the wallet.
 * @requires `useAppSelector` hook with `selectLocalDevices` selector for fetching the local devices where the wallet is stored.
 * @requires `useSecurityTransactions` hook for orchestrating the series of encryption and decryption operations.
 */
export const useSecurityUpgrade = () => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]

    const { executeTransactions } = useSecurityTransactions({
        operationType: OperationType.UPGRADE_SECURITY,
    })

    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (isWalletSecurityBiometrics) return

            const operations: Operation[] = []

            try {
                debug("SECURITY UPGRADE START")

                for (const device of devices) {
                    const { decryptedWallet } = await CryptoUtils.decryptWallet(
                        device,
                        password,
                    )

                    operations.push({
                        operation: CryptoUtils.encryptWallet,
                        data: {
                            wallet: decryptedWallet,
                            rootAddress: device.rootAddress,
                            accessControl: true,
                            device,
                        },
                    })
                }

                await executeTransactions(operations, password)

                onSuccessCallback?.()

                debug("SECURITY UPGRADE SUCCESS")
            } catch (e) {
                error("SECURITY UPGRADE ERROR", e)
            }
        },
        [devices, executeTransactions, isWalletSecurityBiometrics],
    )

    return runSecurityUpgrade
}
