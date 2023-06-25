import { useCallback } from "react"
import { useWalletSecurity } from "~Hooks"
import { LocalDevice, SecurityLevelType, Wallet } from "~Model"
import { CryptoUtils, error, info } from "~Utils"
import {
    selectLocalDevices,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    bulkUpdateDevices,
    setUserSelectedSecurity,
} from "~Storage/Redux/Actions"
import { showErrorToast } from "~Components"
import { useI18nContext } from "~i18n"

type Operation = {
    operation: Function
    data: EncryptOperation
}

type EncryptOperation = {
    device: LocalDevice
    wallet: Wallet
    rootAddress: string
    accessControl: boolean
    hashEncryptionKey?: string
}

/**
 *  hook to trigger the security upgrade by decrypting and re-encrypting the wallet with the new security level
 * @returns  a function to trigger the security upgrade
 */
export const useSecurityUpgrade = () => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]
    const dispatch = useAppDispatch()

    const { LL } = useI18nContext()

    const rollbackTransactions = useCallback(
        async (operations: Operation[]) => {
            info("[START] - Rollback transactions")

            try {
                const updatedDevices: LocalDevice[] = []

                for (const operation of operations) {
                    // encrypt wallets with new pin and save new encryption keys to keychain
                    const { encryptedWallet } = await operation.operation({
                        wallet: operation.data.wallet,
                        rootAddress: operation.data.rootAddress,
                        accessControl: operation.data.accessControl,
                        hashEncryptionKey: operation.data.hashEncryptionKey,
                    })

                    const updatedDevice = {
                        ...operation.data.device,
                        wallet: encryptedWallet,
                    }

                    updatedDevices.push(updatedDevice)
                }

                dispatch(bulkUpdateDevices(updatedDevices))

                dispatch(setUserSelectedSecurity(SecurityLevelType.SECRET))

                info("[END] - Rollback transactions")
            } catch (e) {
                // todo -> handle error how? -> reset app
                error("[FAILED] - Rollback transactions:", e)
            }
        },
        [dispatch],
    )

    const executeTransactions = useCallback(
        async (operations: Operation[], currentPassword: string) => {
            if (operations.length === 0) return

            const rollbackOperations: Operation[] = []

            try {
                info("[START] - Transactions for upgrading security")

                const updatedDevices: LocalDevice[] = []

                for (const operation of operations) {
                    // set the old values in the rollback operations
                    rollbackOperations.push({
                        operation: CryptoUtils.encryptWallet,
                        data: {
                            wallet: operation.data.wallet,
                            rootAddress: operation.data.rootAddress,
                            accessControl: false,
                            hashEncryptionKey: currentPassword,
                            device: operation.data.device,
                        },
                    })

                    // encrypt wallets with new pin and save new encryption keys to keychain
                    const { encryptedWallet } = await operation.operation({
                        wallet: operation.data.wallet,
                        rootAddress: operation.data.rootAddress,
                        accessControl: operation.data.accessControl,
                    })

                    const updatedDevice = {
                        ...operation.data.device,
                        wallet: encryptedWallet,
                    }

                    if (updatedDevices.length > 1)
                        throw new Error("Test rollback")

                    updatedDevices.push(updatedDevice)
                }

                dispatch(bulkUpdateDevices(updatedDevices))

                dispatch(setUserSelectedSecurity(SecurityLevelType.BIOMETRIC))

                info("[END] - Transactions for upgrading security")
            } catch (e) {
                error("[FAILED] - Transactions for upgrading security:", e)

                showErrorToast(LL.COMMON_OOPS(), LL.ERROR_SECURITY_UPGRADE())

                // if no operations were finished, no need to rollback
                if (rollbackOperations.length === 0) return

                // rollback all operations
                await rollbackTransactions(rollbackOperations)
            }
        },
        [LL, dispatch, rollbackTransactions],
    )

    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (isWalletSecurityBiometrics) return

            const operations: Operation[] = []

            try {
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
            } catch (e) {
                error("SECURITY UPGRADE ERROR", e)
            }
        },
        [devices, executeTransactions, isWalletSecurityBiometrics],
    )

    return runSecurityUpgrade
}
