import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import {
    BaseView,
    DelegationView,
    EstimatedTimeDetailsView,
    FadeoutButton,
    GasFeeOptions,
    Layout,
    RequireUserPassword,
    TransferCard,
} from "~Components"
import { useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN>

export const ConvertTransactionScreen: React.FC<Props> = ({ route }) => {
    const { transactionClauses } = route.params

    const { LL } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const toAddresses = useMemo(() => {
        return transactionClauses.reduce((acc: string[], clause) => {
            if (clause.to) acc.push(clause.to)
            return acc
        }, [])
    }, [transactionClauses])

    const onTransactionSuccess = useCallback(() => {}, [])
    const onTransactionFailure = useCallback(() => {}, [])

    const {
        selectedDelegationOption,
        loadingGas,
        onSubmit,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        setSelectedFeeOption,
        selectedFeeOption,
        gasFeeOptions,
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        isEnoughGas,
        txCostTotal,
        isDelegated,
        selectedDelegationAccount,
        selectedDelegationUrl,
        vtho,
        isDisabledButtonState,
    } = useTransactionScreen({
        clauses: transactionClauses,
        onTransactionSuccess,
        onTransactionFailure,
    })

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noStaticBottomPadding
            body={
                <BaseView mb={80} mt={8}>
                    <TransferCard
                        fromAddress={selectedAccount.address}
                        toAddresses={toAddresses}
                        isFromAccountLedger={selectedAccount.device?.type === DEVICE_TYPE.LEDGER}
                    />

                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
                    />

                    <DelegationView
                        setNoDelegation={resetDelegation}
                        selectedDelegationOption={selectedDelegationOption}
                        setSelectedDelegationAccount={setSelectedDelegationAccount}
                        selectedDelegationAccount={selectedDelegationAccount}
                        selectedDelegationUrl={selectedDelegationUrl}
                        setSelectedDelegationUrl={setSelectedDelegationUrl}
                    />

                    <GasFeeOptions
                        setSelectedFeeOption={setSelectedFeeOption}
                        selectedDelegationOption={selectedDelegationOption}
                        loadingGas={loadingGas}
                        selectedFeeOption={selectedFeeOption}
                        gasFeeOptions={gasFeeOptions}
                        isThereEnoughGas={isEnoughGas}
                        totalBalance={vtho.balance.balance}
                        txCostTotal={txCostTotal}
                        isDelegated={isDelegated}
                    />

                    <EstimatedTimeDetailsView selectedFeeOption={selectedFeeOption} />
                </BaseView>
            }
            footer={
                <FadeoutButton
                    testID="confirm-send-button"
                    title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                    action={onSubmit}
                    disabled={isDisabledButtonState}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}
