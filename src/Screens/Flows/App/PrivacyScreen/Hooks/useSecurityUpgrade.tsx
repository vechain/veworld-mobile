import { useCallback } from "react"
import { useWalletSecurity } from "~Hooks"
import { useSecurityUpdate } from "./useSecurityUpdate"

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
 */
export const useSecurityUpgrade = () => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const updateSecurityMethod = useSecurityUpdate()

    return useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (isWalletSecurityBiometrics) return

            await updateSecurityMethod(password)

            onSuccessCallback?.()
        },
        [updateSecurityMethod, isWalletSecurityBiometrics],
    )
}
