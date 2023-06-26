import { useCallback } from "react"
import { showErrorToast } from "~Components"
import { usePasswordValidation } from "~Hooks"
import { LocalDevice, SecurityLevelType, Wallet } from "~Model"
import {
    bulkUpdateDevices,
    setUserSelectedSecurity,
    useAppDispatch,
} from "~Storage/Redux"
import { CryptoUtils, error, info } from "~Utils"
import { useI18nContext } from "~i18n"

export enum OperationType {
    EDIT_PIN = "EDIT_PIN",
    UPGRADE_SECURITY = "UPGRADE_SECURITY",
}

export type Operation = {
    operation: Function
    data: EncryptOperation
}

export type EncryptOperation = {
    device: LocalDevice
    wallet: Wallet
    rootAddress: string
    accessControl: boolean
    hashEncryptionKey?: string
}

type Props = {
    operationType: OperationType
    onStateCleanup?: () => void
}

/**
 * `useSecurityTransactions` is a custom hook that manages security related transactions.
 * The hook provides two main functionalities - executing transactions and handling necessary rollbacks in case of errors.
 *
 * @param {Props} props - Object containing operationType and onStateCleanup.
 * @param {OperationType} props.operationType - The type of operation to be performed (EDIT_PIN, UPGRADE_SECURITY).
 * @param {() => void} props.onStateCleanup - Optional function to clean up state after operations are complete.
 *
 * @returns {Object} - Contains the function `executeTransactions` which triggers the execution of provided operations.
 *
 * @example
 *  const { executeTransactions } = useSecurityTransactions({ operationType: OperationType.UPGRADE_SECURITY })
 *  executeTransactions(operations, 'password123')
 */
export const useSecurityTransactions = ({
    operationType,
    onStateCleanup,
}: Props) => {
    const dispatch = useAppDispatch()

    const { LL } = useI18nContext()

    const { updatePassword } = usePasswordValidation()

    /**
     * Executes a single operation and returns an updated device.
     *
     * @private
     * @param {Operation} operation - The operation to be executed.
     * @returns {Promise<LocalDevice>} - The updated device after the operation.
     */
    const executeOperation = useCallback(async (operation: Operation) => {
        const { encryptedWallet } = await operation.operation({
            wallet: operation.data.wallet,
            rootAddress: operation.data.rootAddress,
            accessControl: operation.data.accessControl,
            hashEncryptionKey: operation.data.hashEncryptionKey,
        })

        return {
            ...operation.data.device,
            wallet: encryptedWallet,
        }
    }, [])

    /**
     * Handles the rollback of operations in case of errors.
     *
     * @private
     * @param {Operation[]} rollbackOperations - Array of operations to rollback.
     * @param {string} currentPassword - The current password used for the operations.
     */
    const rollbackTransactions = useCallback(
        async (rollbackOperations: Operation[], currentPassword: string) => {
            info("[START] - Rolling back transactions")

            try {
                const updatedDevices: LocalDevice[] = []

                // Rollback all operations comming from the transactions
                for (const operation of rollbackOperations) {
                    const updatedDevice = await executeOperation(operation)

                    updatedDevices.push(updatedDevice)
                }

                // set updated devices in redux
                dispatch(bulkUpdateDevices(updatedDevices))

                if (operationType === OperationType.EDIT_PIN) {
                    // update password checker string on redux
                    updatePassword(
                        rollbackOperations[0].data.hashEncryptionKey ??
                            currentPassword,
                    )

                    // reset state
                    onStateCleanup?.()
                } else {
                    dispatch(setUserSelectedSecurity(SecurityLevelType.SECRET))
                }

                info("[END] - Rolling back transactions")
            } catch (e) {
                // todo -> handle error how? -> reset app
                error("Rollback failed", e)
            }
        },
        [
            dispatch,
            executeOperation,
            onStateCleanup,
            operationType,
            updatePassword,
        ],
    )

    /**
     * Executes a list of provided operations and handles rollbacks in case of any errors.
     * Updates the devices in the redux store after each operation and handles state cleanup.
     *
     * @public
     * @param {Operation[]} operations - Array of operations to execute.
     * @param {string} currentPassword - The current password used for the operations.
     */
    const executeTransactions = useCallback(
        async (operations: Operation[], currentPassword: string) => {
            if (operations.length === 0) return

            const rollbackOperations: Operation[] = []

            try {
                info(
                    `[START] - Executing ${
                        operationType === OperationType.EDIT_PIN
                            ? "Edit pin"
                            : "Upgrade Secuity"
                    } transactions`,
                )

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

                    const updatedDevice = await executeOperation(operation)

                    updatedDevices.push(updatedDevice)

                    // Uncomment this to test rollbacks (at least 2 devices are needed)
                    /* if (updatedDevices.length > 1)
                        throw new Error("Test rollback") */
                }

                dispatch(bulkUpdateDevices(updatedDevices))

                if (operationType === OperationType.EDIT_PIN) {
                    // update password checker string on redux
                    updatePassword(
                        operations[0].data.hashEncryptionKey ?? currentPassword,
                    )
                } else {
                    //update selected security level type
                    dispatch(
                        setUserSelectedSecurity(SecurityLevelType.BIOMETRIC),
                    )
                }

                info(
                    `[END] - Executing ${
                        operationType === OperationType.EDIT_PIN
                            ? "Edit pin"
                            : "Upgrade Secuity"
                    } transactions`,
                )
            } catch (e) {
                info(
                    `[FAILED] - Executing ${
                        operationType === OperationType.EDIT_PIN
                            ? "Edit pin"
                            : "Upgrade Secuity"
                    } transactions`,
                )

                showErrorToast(LL.COMMON_OOPS(), LL.ERROR_SECURITY_UPGRADE())

                // if no operations were finished, no need to rollback
                if (rollbackOperations.length === 0) return

                // rollback all operations
                await rollbackTransactions(rollbackOperations, currentPassword)
            } finally {
                if (operationType === OperationType.EDIT_PIN) {
                    // reset state
                    onStateCleanup?.()
                }
            }
        },
        [
            LL,
            dispatch,
            executeOperation,
            onStateCleanup,
            operationType,
            rollbackTransactions,
            updatePassword,
        ],
    )

    return {
        executeTransactions,
    }
}
