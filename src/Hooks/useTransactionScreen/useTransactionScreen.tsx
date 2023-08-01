import { Transaction } from "thor-devkit"
import React, { useCallback, useMemo, useState } from "react"
import {
    SignStatus,
    SignTransactionResponse,
    useCheckIdentity,
    useRenderGas,
    useSendTransaction,
    useSignTransaction,
    useTransactionGas,
} from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    selectSelectedAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useDelegation } from "~Screens/Flows/App/SendScreen/04-TransactionSummarySendScreen/Hooks"
import { useTransactionBuilder } from "~Hooks/useTransactionBuilder/useTransactionBuilder"
import {
    AccountCard,
    BaseCard,
    BaseSpacer,
    BaseText,
    DelegationOptions,
    FadeoutButton,
    showWarningToast,
} from "~Components"
import { error } from "~Utils"
import { DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { Routes } from "~Navigation"

type Props = {
    clauses: Transaction.Body["clauses"]
    onTransactionSuccess: (transaction: Transaction, txId: string) => void
    onTransactionFailure: (error: unknown) => void
    initialRoute: Routes
    options?: Connex.Driver.TxOptions
}

export const useTransactionScreen = ({
    clauses,
    onTransactionSuccess,
    onTransactionFailure,
    initialRoute,
    options,
}: Props) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const [loading, setLoading] = useState(false)

    // 1. Gas
    const { gas, loadingGas, setGasPayer } = useTransactionGas({
        clauses,
    })

    // 2. Delegation
    const {
        setNoDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        selectedDelegationOption,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDelegated,
    } = useDelegation({ setGasPayer, providedUrl: options?.delegator?.url })

    // 3. Build transaction
    const buildTransaction = useTransactionBuilder({
        clauses,
        gas,
        isDelegated,
        dependsOn: options?.dependsOn,
        providedGas: options?.gas,
    })

    // 4. Sign transaction
    const { signTransaction, navigateToLedger } = useSignTransaction({
        buildTransaction,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
        initialRoute,
    })

    // 5. Send transaction
    const { sendTransaction } = useSendTransaction(onTransactionSuccess)

    const { RenderGas, isThereEnoughGas, vthoGas, vthoBalance } = useRenderGas({
        loadingGas,
        selectedDelegationOption,
        gas,
        accountAddress:
            selectedDelegationAccount?.address ?? selectedAccount.address,
    })

    /**
     * Signs the transaction and sends it to the blockchain
     */
    const signAndSendTransaction = useCallback(
        async (password?: string) => {
            try {
                const transaction: SignTransactionResponse =
                    await signTransaction(password)

                switch (transaction) {
                    case SignStatus.NAVIGATE_TO_LEDGER:
                        return
                    case SignStatus.DELEGATION_FAILURE:
                        showWarningToast(
                            LL.ERROR(),
                            LL.SEND_DELEGATION_ERROR_SIGNATURE(),
                        )
                        return
                    default:
                        await sendTransaction(transaction)
                }
            } catch (e) {
                error("signAndSendTransaction", e)
                onTransactionFailure(e)
            } finally {
                setLoading(false)
                dispatch(setIsAppLoading(false))
            }
        },
        [onTransactionFailure, dispatch, signTransaction, sendTransaction, LL],
    )

    const {
        ConfirmIdentityBottomSheet,
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
    } = useCheckIdentity({
        onIdentityConfirmed: signAndSendTransaction,
        onCancel: () => setLoading(false),
        allowAutoPassword: true,
    })

    //TODO: Fix this for delegation errors
    const onSubmit = useCallback(async () => {
        if (
            selectedAccount.device.type === DEVICE_TYPE.LEDGER &&
            selectedDelegationOption !== DelegationType.ACCOUNT
        ) {
            const tx = buildTransaction()

            try {
                await navigateToLedger(
                    tx,
                    selectedAccount as LedgerAccountWithDevice,
                )
            } catch (e) {
                error("onSubmit:navigateToLedger", e)
                onTransactionFailure(e)
            }
        } else {
            await checkIdentityBeforeOpening()
        }
    }, [
        onTransactionFailure,
        buildTransaction,
        selectedAccount,
        selectedDelegationOption,
        navigateToLedger,
        checkIdentityBeforeOpening,
    ])

    const continueNotAllowed = useMemo(
        () =>
            !isThereEnoughGas &&
            selectedDelegationOption !== DelegationType.URL,
        [isThereEnoughGas, selectedDelegationOption],
    )

    const isLoading = useMemo(
        () => loading || loadingGas || isBiometricsEmpty,
        [loading, loadingGas, isBiometricsEmpty],
    )

    const SubmitButton = () => (
        <FadeoutButton
            title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
            action={onSubmit}
            disabled={continueNotAllowed || isLoading}
            isLoading={isLoading}
            bottom={0}
            mx={0}
            width={"auto"}
        />
    )

    const Delegation = () => (
        <>
            <DelegationOptions
                setNoDelegation={setNoDelegation}
                selectedDelegationOption={selectedDelegationOption}
                setSelectedAccount={setSelectedDelegationAccount}
                selectedAccount={selectedDelegationAccount}
                selectedDelegationUrl={selectedDelegationUrl}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
            />
            {selectedDelegationAccount && (
                <>
                    <BaseSpacer height={16} />
                    <AccountCard account={selectedDelegationAccount} />
                </>
            )}
            {selectedDelegationUrl && (
                <>
                    <BaseSpacer height={16} />
                    <BaseCard>
                        <BaseText py={8}>{selectedDelegationUrl}</BaseText>
                    </BaseCard>
                </>
            )}
        </>
    )

    return {
        ConfirmIdentityBottomSheet,
        Delegation,
        SubmitButton,
        RenderGas,
        selectedDelegationOption,
        vthoGas,
        vthoBalance,
        isThereEnoughGas,
        onSubmit,
        isLoading,
        continueNotAllowed,
    }
}
