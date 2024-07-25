import { useCallback, useState } from "react"
import { IMPORT_TYPE, NewLedgerDevice } from "~Model"
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
import { selectAccountsState, selectHasOnboarded } from "~Storage/Redux/Selectors"
import { warn } from "~Utils/Logger"
import { useBiometrics } from "../useBiometrics"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"
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
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
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
            isImported,
            mnemonic,
            privateKey,
            userPassword,
            importType,
            onError,
        }: {
            isImported: boolean
            mnemonic?: string[]
            privateKey?: string
            userPassword?: string
            importType?: IMPORT_TYPE
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
                track(AnalyticsEvent.WALLET_GENERATION, {
                    context: userHasOnboarded ? "management" : "onboarding",
                    type: !isImported ? "create" : "import",
                    signature: "local",
                    importType: importType,
                })
                if (!userHasOnboarded)
                    track(AnalyticsEvent.ONBOARDING_SUCCESS, {
                        type: !mnemonic && !privateKey ? "create" : "import",
                        signature: "local",
                        importType: importType,
                    })
            } catch (e) {
                warn(ERROR_EVENTS.WALLET_CREATION, e)
                track(AnalyticsEvent.WALLET_ADD_LOCAL_ERROR)
                onError?.(e)
                throw e
            }
        },
        [createDevice, dispatch, selectedAccount, track, userHasOnboarded],
    )
    //* [END] - Create Wallet

    /**
     * Insert new ledger wallet in store
     * @param newLedger new ledger device
     * @param onError callback called if error
     * @returns void
     */
    const createLedgerWallet = useCallback(
        async ({
            newLedger,
            isImported,
            onError,
        }: {
            newLedger: NewLedgerDevice
            isImported: boolean
            onError?: (error: unknown) => void
        }) => {
            try {
                const { accounts } = await dispatch(addLedgerDeviceAndAccounts(newLedger)).unwrap()

                dispatch(setNewLedgerDevice(undefined))

                if (!selectedAccount) dispatch(setSelectedAccount({ address: accounts[0]?.address }))

                setIsComplete(true)
                track(AnalyticsEvent.WALLET_ADD_LEDGER_SUCCESS)
                track(AnalyticsEvent.WALLET_GENERATION, {
                    context: userHasOnboarded ? "management" : "onboarding",
                    type: !isImported ? "create" : "import",
                    signature: "hardware",
                })
                if (!userHasOnboarded)
                    track(AnalyticsEvent.ONBOARDING_SUCCESS, {
                        type: !isImported ? "create" : "import",
                        signature: "hardware",
                    })
            } catch (e) {
                warn(ERROR_EVENTS.WALLET_CREATION, e)
                track(AnalyticsEvent.WALLET_ADD_LEDGER_ERROR)
                onError?.(e)
                throw e
            }
        },
        [dispatch, selectedAccount, track, userHasOnboarded],
    )
    //* [END] - Create Wallet

    return {
        createLocalWallet,
        createLedgerWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
