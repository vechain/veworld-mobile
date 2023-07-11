import { useCallback, useState } from "react"
import { CryptoUtils } from "~Utils"
import { NewLedgerDevice, WALLET_STATUS } from "~Model"
import { useDeviceUtils } from "../useDeviceUtils"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    addDeviceAndAccounts,
    selectAccount,
    setMnemonic,
    setAppLockStatus,
    setNewLedgerDevice,
    addLedgerDeviceAndAccounts,
} from "~Storage/Redux/Actions"
import { selectAccountsState } from "~Storage/Redux/Selectors"
import { error } from "~Utils/Logger"
import { useBiometrics } from "../useBiometrics"
/**
 * useCreateWallet is a hook that allows you to create a wallet and store it in the store
 * @example const { onCreateWallet, accessControl, isComplete } = useCreateWallet()
 * @returns { onCreateWallet, accessControl, isComplete }
 * @category Hooks
 * @returns
 */
export const useCreateWallet = () => {
    const { getDeviceFromMnemonic } = useDeviceUtils()
    const biometrics = useBiometrics()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectAccountsState)?.selectedAccount
    const [isComplete, setIsComplete] = useState(false)

    /**
     * Insert new wallet in store
     * if userPassword is provided, encrypt the wallet with it and store the hash
     * @param mnemonic mnemonic
     * @param userPassword optional user password to encrypt the wallet
     * @param onError callback called if erorr
     * @returns void
     */
    const onCreateWallet = useCallback(
        async ({
            mnemonic,
            userPassword,
            onError,
        }: {
            mnemonic: string
            userPassword?: string
            onError?: (error: unknown) => void
        }) => {
            try {
                const { device, wallet } = getDeviceFromMnemonic(mnemonic)
                dispatch(setMnemonic(undefined))

                // if userPassword is provided, encrypt the wallet with access control false
                const accessControl = userPassword
                    ? false
                    : biometrics?.accessControl ?? false

                const { encryptedWallet } = await CryptoUtils.encryptWallet({
                    wallet,
                    rootAddress: device.rootAddress,
                    accessControl,
                    hashEncryptionKey: userPassword,
                })

                const newAccount = dispatch(
                    addDeviceAndAccounts({
                        ...device,
                        wallet: encryptedWallet,
                    }),
                )

                dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))

                if (!selectedAccount)
                    dispatch(selectAccount({ address: newAccount.address }))

                setIsComplete(true)
            } catch (e) {
                error("CREATE WALLET ERROR : ", e)
                onError?.(e)
            }
        },
        [dispatch, biometrics, getDeviceFromMnemonic, selectedAccount],
    )
    //* [END] - Create Wallet

    /**
     * Insert new ledger wallet in store
     * @param newLedger new ledger device
     * @param onError callback called if error
     * @returns void
     */
    const onCreateLedgerWallet = useCallback(
        async ({
            newLedger,
            onError,
        }: {
            newLedger: NewLedgerDevice
            onError?: (error: unknown) => void
        }) => {
            try {
                const { accounts } = await dispatch(
                    addLedgerDeviceAndAccounts(newLedger),
                ).unwrap()

                dispatch(setNewLedgerDevice(undefined))

                dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))

                if (!selectedAccount)
                    dispatch(selectAccount({ address: accounts[0]?.address }))

                setIsComplete(true)
            } catch (e) {
                error("CREATE HW WALLET ERROR : ", e)
                onError?.(e)
            }
        },
        [dispatch, selectedAccount],
    )
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        onCreateLedgerWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
