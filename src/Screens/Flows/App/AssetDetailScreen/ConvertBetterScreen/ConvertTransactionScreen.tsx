import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Transaction } from "@vechain/sdk-core"
import React, { useCallback, useMemo } from "react"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationView,
    EstimatedTimeDetailsView,
    FadeoutButton,
    FiatBalance,
    GasFeeOptions,
    Layout,
    RequireUserPassword,
} from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useFormatFiat, useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectCurrency, selectNetworkVBDTokens, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { TransferTokenCardGroup } from "./Components"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN>

export const ConvertTransactionScreen: React.FC<Props> = ({ route, navigation }) => {
    const { amount, transactionClauses, token } = route.params

    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const { formatLocale } = useFormatFiat()

    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)

    const currency = useAppSelector(selectCurrency)

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
    })

    // const selectedAccount = useAppSelector(selectSelectedAccount)
    const toAddresses = useMemo(() => {
        return transactionClauses.reduce((acc: string[], clause) => {
            if (clause.to) acc.push(clause.to)
            return acc
        }, [])
    }, [transactionClauses])

    const convertFromTo = useMemo(() => {
        // When we want to convert B3TR to VOT3 token we have to first do
        // a call to the B3TR contract in order to approve the transaction
        // here I'm checking if the first clause is to the B3TR address then
        // we are converting B3TR --> VOT3 otherwise is VOT3 --> B3TR
        if (AddressUtils.compareAddresses(toAddresses[0], B3TR.address)) {
            return {
                fromToken: B3TR,
                toToken: VOT3,
            }
        } else {
            return {
                fromToken: VOT3,
                toToken: B3TR,
            }
        }
    }, [B3TR, VOT3, toAddresses])

    const formattedAmount = useMemo(
        () => BigNutils(amount).toTokenFormat_string(2, formatLocale),
        [amount, formatLocale],
    )

    const fiatHumanAmount = BigNutils().toCurrencyConversion(amount, exchangeRate)

    const onTransactionSuccess = useCallback(
        (_transaction: Transaction, txId: string) => {
            track(AnalyticsEvent.CONVERT_B3TR_VOT3_SUCCESS, {
                from: convertFromTo.fromToken?.symbol,
                to: convertFromTo.toToken?.symbol,
                amount: formattedAmount,
            })

            navigation.replace(Routes.TOKEN_DETAILS, {
                token,
                betterConversionResult: {
                    txId,
                    amount: formattedAmount,
                    from: convertFromTo.fromToken,
                    to: convertFromTo.toToken,
                },
            })
            dispatch(setIsAppLoading(false))
        },
        [track, convertFromTo.fromToken, convertFromTo.toToken, formattedAmount, navigation, token, dispatch],
    )
    const onTransactionFailure = useCallback(() => {
        track(AnalyticsEvent.CONVERT_B3TR_VOT3_FAILED, {
            from: convertFromTo.fromToken?.symbol,
            to: convertFromTo.toToken?.symbol,
            amount: formattedAmount,
        })
        // console.log(error)
    }, [formattedAmount, convertFromTo.fromToken?.symbol, convertFromTo.toToken?.symbol, track])

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
            title={LL.BTN_CONVERT()}
            noStaticBottomPadding
            body={
                <BaseView mb={80} mt={8}>
                    <TransferTokenCardGroup {...convertFromTo} />

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

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="subSubTitleSemiBold">{LL.DETAILS()}</BaseText>
                    <BaseSpacer height={12} />
                    <BaseText typographyFont="caption">{LL.SEND_AMOUNT()}</BaseText>
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="subSubTitle">{formattedAmount}</BaseText>
                        <BaseText typographyFont="bodyBold" mx={4}>
                            {convertFromTo.fromToken?.symbol}
                        </BaseText>
                        {exchangeRate && (
                            <FiatBalance
                                typographyFont="buttonSecondary"
                                balances={[fiatHumanAmount.value]}
                                prefix="≈ "
                            />
                        )}
                    </BaseView>

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
