import { isEmpty } from "lodash"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDisclosure, usePasswordValidation, useWalletSecurity } from "~Hooks"
import { LocalDevice, Wallet } from "~Model"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"
import {
    bulkUpdateDevices,
    selectLocalDevices,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { CryptoUtils, info, error } from "~Utils"

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
    _oldPin?: string
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

    // Roll back transactions and the rest
    const rollbackTransactions = useCallback(
        async (rollbackOperations: Operation[]) => {
            info("Rolling back transactions")

            try {
                const updatedDevices: LocalDevice[] = []

                // Rollback all operations comming from the transactions
                for (const _operation of rollbackOperations) {
                    const { encryptedWallet } = await _operation.operation({
                        wallet: _operation?.data?.wallet,
                        rootAddress: _operation?.data?.rootAddress,
                        accessControl: _operation.data.accessControl,
                        hashEncryptionKey: _operation.data.hashEncryptionKey,
                    })

                    const updatedDevice = {
                        ..._operation?.data?.device,
                        wallet: encryptedWallet,
                    }

                    updatedDevices.push(updatedDevice)
                }

                // set updated devices in redux
                dispatch(bulkUpdateDevices(updatedDevices))

                // update password checker string on redux
                updatePassword(rollbackOperations[0].data.hashEncryptionKey)

                // reset state
                onStateCleanup()

                info("Rolling back successful")
            } catch (e) {
                // todo -> handle error how? -> reset app
                error("Rollback failed", e)
            }
        },
        [dispatch, onStateCleanup, updatePassword],
    )

    const executeTransactions = useCallback(
        async (operations: Operation[]) => {
            // use a counter to know if we have at least one operation that was finished in order to rollback
            let localOperationFinishedCounter = 0

            // Keep  tab of all operations that need to be rolled back
            const rollbackOperations: Operation[] = []

            try {
                info("Transactions started")
                const updatedDevices: LocalDevice[] = []

                // last minute check
                if (operations.length === 0) return

                for (const index of operations.keys()) {
                    const _operation = operations[index]

                    // set the old values in the rollback operations
                    rollbackOperations.push({
                        operation: CryptoUtils.encryptWallet,
                        data: {
                            wallet: _operation?.data?.wallet,
                            rootAddress: _operation?.data?.rootAddress,
                            accessControl: _operation.data.accessControl,
                            hashEncryptionKey: _operation.data._oldPin!,
                            device: _operation.data.device,
                        },
                    })

                    // encrypt wallets with new pin and save new encryption keys to keychain
                    const { encryptedWallet } = await _operation.operation({
                        wallet: _operation?.data?.wallet,
                        rootAddress: _operation?.data?.rootAddress,
                        accessControl: _operation.data.accessControl,
                        hashEncryptionKey: _operation.data.hashEncryptionKey,
                    })

                    // update local counter to know if we need to rollback
                    localOperationFinishedCounter += 1

                    /*
                        ! Uncomment this to test rollback (need to have more 2 wallets)
                        if (localOperationFinishedCounter === 2)
                            throw new Error("Test error")
                    */

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

                info("Transactions committed")
            } catch (e) {
                error("Transaction failed", e)
                // if no operations were finished, no need to rollback
                if (localOperationFinishedCounter === 0) return

                // rollback transactions
                await rollbackTransactions(rollbackOperations)
            } finally {
                // reset state
                onStateCleanup()
            }
        },
        [dispatch, onStateCleanup, rollbackTransactions, updatePassword],
    )

    const changePinInWallets = useCallback(
        async (_oldPin: string, newPin: string) => {
            if (isWalletSecurityBiometrics) return

            const operations: Operation[] = []

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
                        _oldPin,
                        device,
                    },
                })
            }

            await executeTransactions(operations)
        },
        [devices, executeTransactions, isWalletSecurityBiometrics],
    )

    const onPinSuccess = useCallback(
        async (pin: string) => {
            if (!pin) return

            if (isEmpty(oldPin)) {
                // get current pin
                setOldPin(pin)
                setScenario(LOCKSCREEN_SCENARIO.EDIT_NEW_PIN)
            } else {
                // user can't use the same pin as the old one
                if (pin === oldPin) {
                    setOldPin("")
                    setScenario(LOCKSCREEN_SCENARIO.EDIT_OLD_PIN)
                    return
                }

                // is new pin
                await changePinInWallets(oldPin, pin)
            }
        },
        [changePinInWallets, oldPin],
    )

    // [END] - Internal Methods

    useEffect(() => {
        // clean up state
        setScenario(LOCKSCREEN_SCENARIO.EDIT_OLD_PIN)
        setOldPin("")
    }, [])

    return {
        onEditPinPress,
        isEditPinPromptOpen,
        closeEditPinPrompt,
        onPinSuccess,
        lockScreenScenario,
        isValidatePassword,
    }
}
