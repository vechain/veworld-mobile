import { useCallback, useState } from "react"
import { NewLedgerDevice } from "~Model"
import { useDeviceUtils } from "../useDeviceUtils"
import {
    addDeviceAndAccounts,
    addLedgerDeviceAndAccounts,
    setMnemonic,
    setNewLedgerDevice,
    setPrivateKey,
    setSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { selectAccountsState } from "~Storage/Redux/Selectors"
import { error } from "~Utils/Logger"
import { useBiometrics } from "../useBiometrics"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { AnalyticsEvent } from "~Constants"
import { WalletEncryptionKeyHelper } from "~Components"

/**
 * useCreateWallet is a hook that allows you to create a wallet and store it in the store
 * @example const { createLocalWallet, accessControl, isComplete } = useCreateWallet()
 * @returns { createLocalWallet, accessControl, isComplete }
 * @category Hooks
 * @returns
 */
export const useCreateWallet = () => {
    const { createDevice } = useDeviceUtils()
    const biometrics = useBiometrics()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectAccountsState)?.selectedAccount
    const [isComplete, setIsComplete] = useState(false)
    const track = useAnalyticTracking()
    /**
     * Insert new wallet in store
     * if userPassword is provided, encrypt the wallet with it and store the hash
     * @param mnemonic mnemonic
     * @param userPassword optional user password to encrypt the wallet
     * @param onError callback called if erorr
     * @returns void
     */
    const createLocalWallet = useCallback(
        async ({
            mnemonic,
            privateKey,
            userPassword,
            onError,
        }: {
            mnemonic?: string[]
            privateKey?: string
            userPassword?: string
            onError?: (error: unknown) => void
        }) => {
            try {
                const { device, wallet } = createDevice(mnemonic, privateKey)

                const encryptedWallet = await WalletEncryptionKeyHelper.encryptWallet(wallet, userPassword)

                const newAccount = dispatch(
                    addDeviceAndAccounts({
                        ...device,
                        wallet: encryptedWallet,
                    }),
                )

                if (!selectedAccount) dispatch(setSelectedAccount({ address: newAccount.address }))

                dispatch(setMnemonic(undefined))
                dispatch(setPrivateKey(undefined))
                setIsComplete(true)
                track(AnalyticsEvent.WALLET_ADD_LOCAL_SUCCESS)
            } catch (e) {
                error("CREATE WALLET ERROR : ", e)
                track(AnalyticsEvent.WALLET_ADD_LOCAL_ERROR)
                onError?.(e)
                throw e
            }
        },
        [dispatch, createDevice, selectedAccount, track],
    )
    //* [END] - Create Wallet

    /**
     * Insert new ledger wallet in store
     * @param newLedger new ledger device
     * @param onError callback called if error
     * @returns void
     */
    const createLedgerWallet = useCallback(
        async ({ newLedger, onError }: { newLedger: NewLedgerDevice; onError?: (error: unknown) => void }) => {
            try {
                const { accounts } = await dispatch(addLedgerDeviceAndAccounts(newLedger)).unwrap()

                dispatch(setNewLedgerDevice(undefined))

                if (!selectedAccount) dispatch(setSelectedAccount({ address: accounts[0]?.address }))

                setIsComplete(true)
                track(AnalyticsEvent.WALLET_ADD_LEDGER_SUCCESS)
            } catch (e) {
                error("CREATE HW WALLET ERROR : ", e)
                track(AnalyticsEvent.WALLET_ADD_LEDGER_ERROR)
                onError?.(e)
                throw e
            }
        },
        [dispatch, selectedAccount, track],
    )
    //* [END] - Create Wallet

    return {
        createLocalWallet,
        createLedgerWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
