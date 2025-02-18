import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { Transaction } from "thor-devkit"
import {
    BaseView,
    DelegationView,
    EstimatedTimeDetailsView,
    FadeoutButton,
    GasFeeOptions,
    Layout,
    RequireUserPassword,
} from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    selectB3trTokenWithBalance,
    selectVot3TokenWithBalance,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { TransferTokenCardGroup } from "./Components"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN>

export const ConvertTransactionScreen: React.FC<Props> = ({ route, navigation }) => {
    const { transactionClauses, token } = route.params

    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const b3trWithBalance = useAppSelector(selectB3trTokenWithBalance)
    const vot3WithBalance = useAppSelector(selectVot3TokenWithBalance)
    // const selectedAccount = useAppSelector(selectSelectedAccount)

    const toAddresses = useMemo(() => {
        return transactionClauses.reduce((acc: string[], clause) => {
            if (clause.to) acc.push(clause.to)
            return acc
        }, [])
    }, [transactionClauses])

    const onTransactionSuccess = useCallback(
        (transaction: Transaction, txId: string) => {
            track(AnalyticsEvent.CONVERT_B3TR_VOT3_SUCCESS)

            const convertTo = AddressUtils.compareAddresses(toAddresses[0], b3trWithBalance?.address) ? "VOT3" : "B3TR"

            navigation.replace(Routes.TOKEN_DETAILS, {
                token,
                betterConversionResult: {
                    txId,
                    isSuccess: true,
                    amount: "",
                    to: convertTo,
                },
            })
            dispatch(setIsAppLoading(false))
        },
        [b3trWithBalance?.address, dispatch, navigation, toAddresses, token, track],
    )
    const onTransactionFailure = useCallback(() => {
        track(AnalyticsEvent.CONVERT_B3TR_VOT3_FAILED)
        // console.log(error)
    }, [track])

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
                    <TransferTokenCardGroup fromToken={b3trWithBalance!} toToken={vot3WithBalance!} />

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
