import { isEmpty } from "lodash"
import { useCallback, useMemo, useState } from "react"
import {
    info,
    useDisclosure,
    usePasswordValidation,
    useWalletSecurity,
    error,
} from "~Common"
import { LocalDevice, Wallet } from "~Model"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"
import {
    bulkUpdateDevices,
    selectLocalDevices,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { CryptoUtils, PasswordUtils } from "~Utils"

type Operation = {
    operation: Function
    data: EncryptOperation
}

type EncryptOperation = {
    device: LocalDevice
    wallet: Wallet
    rootAddress: string
    accessControl: boolean
    hashEncryptionKey: string
}

type RollbackOperation = {
    rollbackOperation: Function
    data: DecryptOperation
}

type DecryptOperation = {
    device: LocalDevice
    wallet: Wallet
    hashEncryptionKey: string
}

export const useEditPin = () => {
    // [START] - Hooks
    const dispatch = useAppDispatch()

    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]

    const [lockScreenScenario, setScenario] = useState(
        LOCKSCREEN_SCENARIO.EDIT_OLD_PIN,
    )

    const [oldPin, setOldPin] = useState("")

    const {
        isOpen: isEditPinPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closeEditPinPrompt,
    } = useDisclosure()

    const { updatePassword } = usePasswordValidation()

    // [END] - Hooks

    // [START] - Internal Methods

    const onEditPinPress = useCallback(() => {
        if (isWalletSecurityBiometrics) return

        openPasswordPrompt()
    }, [isWalletSecurityBiometrics, openPasswordPrompt])

    const isValidatePassword = useMemo(
        () => lockScreenScenario === LOCKSCREEN_SCENARIO.EDIT_OLD_PIN,
        [lockScreenScenario],
    )

    const onStateCleanup = useCallback(() => {
        // close edit pin prompt
        closeEditPinPrompt()

        // reset pin screen scenario
        setScenario(LOCKSCREEN_SCENARIO.EDIT_OLD_PIN)

        // reset old pin
        setOldPin("")
    }, [closeEditPinPrompt])

    const rollbackTransactions = useCallback(
        async (
            oldDevices: LocalDevice[],
            rollbackOperations: RollbackOperation[],
        ) => {
            info("Rolling back transactions")

            try {
                for (const index of rollbackOperations.keys()) {
                    const _rollBackOperation = rollbackOperations[index]

                    // 1. decrypt wallets with new pin

                    // 2. encrypt wallets with old pin
                    await _rollBackOperation.rollbackOperation(
                        _rollBackOperation.data,
                    )
                }

                info("Rolling back successful")
            } catch (e) {
                // todo -> handle error how?
                error("Rollback failed", e)
            }
        },
        [],
    )

    const executeTransactions = useCallback(
        async (
            operations: Operation[],
            rollbackOperations: RollbackOperation[],
        ) => {
            // get a copy of old devices in csae we need to rollback
            const oldDevices = [...devices]

            let localOperationFinishedCounter = 0

            try {
                info("Transactions started")

                const updatedDevices: LocalDevice[] = []

                // last minute check
                if (operations.length === 0) return

                for (const _operation of operations) {
                    // encrypt wallets with new pin and save new encryption keys to keychain
                    const { encryptedWallet } = await _operation.operation({
                        wallet: _operation?.data?.wallet,
                        rootAddress: _operation?.data?.rootAddress,
                        accessControl: _operation.data.accessControl,
                        hashEncryptionKey: _operation.data.hashEncryptionKey,
                    })

                    // update local counter to know if we need to rollback
                    localOperationFinishedCounter++

                    const updatedDevice = {
                        ..._operation?.data?.device,
                        wallet: encryptedWallet,
                    }

                    updatedDevices.push(updatedDevice)
                }

                // update password checker string on redux
                updatePassword(operations[0].data.hashEncryptionKey)

                // set updated devices in redux
                dispatch(bulkUpdateDevices(updatedDevices))

                // reset state
                onStateCleanup()

                info("Transactions committed")
            } catch (e) {
                error("Transaction failed", e)
                // if no operations were finished, no need to rollback
                if (localOperationFinishedCounter === 0) return

                // close edit pin prompt
                closeEditPinPrompt()

                // rollback transactions
                await rollbackTransactions(oldDevices, rollbackOperations)
            }
        },
        [
            closeEditPinPrompt,
            devices,
            dispatch,
            onStateCleanup,
            rollbackTransactions,
            updatePassword,
        ],
    )

    const changePinInWallets = useCallback(
        async (_oldPin: string, newPin: string) => {
            if (isWalletSecurityBiometrics) return

            const operations: Operation[] = []
            const rollbackOperations: RollbackOperation[] = []

            for (const device of devices) {
                const { decryptedWallet } = await CryptoUtils.decryptWallet(
                    device,
                    _oldPin,
                )

                operations.push({
                    operation: CryptoUtils.encryptWallet,
                    data: {
                        wallet: decryptedWallet,
                        rootAddress: device.rootAddress,
                        accessControl: false,
                        hashEncryptionKey: newPin,
                        device,
                    },
                })

                rollbackOperations.push({
                    rollbackOperation: CryptoUtils.decryptWallet,
                    data: {
                        wallet: decryptedWallet,
                        hashEncryptionKey: PasswordUtils.hash(_oldPin),
                        device,
                    },
                })
            }

            await executeTransactions(operations, rollbackOperations)
        },
        [devices, executeTransactions, isWalletSecurityBiometrics],
    )

    const onOldPinSuccess = useCallback(
        async (pin: string) => {
            if (!pin) return

            if (isEmpty(oldPin)) {
                // get current pin
                setOldPin(pin)
                setScenario(LOCKSCREEN_SCENARIO.EDIT_NEW_PIN)
            } else {
                //Todo.vas return human error if pin is the same
                if (pin === oldPin) return

                // is new pin
                await changePinInWallets(oldPin, pin)
            }
        },
        [changePinInWallets, oldPin],
    )

    // [END] - Internal Methods

    return {
        onEditPinPress,
        isEditPinPromptOpen,
        closeEditPinPrompt,
        onOldPinSuccess,
        lockScreenScenario,
        isValidatePassword,
    }
}
