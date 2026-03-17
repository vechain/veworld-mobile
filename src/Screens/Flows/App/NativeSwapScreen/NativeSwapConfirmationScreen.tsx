import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Transaction } from "@vechain/sdk-core"
import React, { useCallback, useMemo } from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationView,
    FadeoutButton,
    GasFeeSpeed,
    Layout,
    RequireUserPassword,
} from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useFormatFiat, useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { useSwapClauses } from "~Hooks/useSwap"
import { SwapQuote } from "~Hooks/useSwap/types"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.NATIVE_SWAP_CONFIRMATION>

export const NativeSwapConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
    const { quote } = route.params
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const { formatLocale } = useFormatFiat()

    const { clauses } = useSwapClauses({ quote })

    const formattedAmountIn = useMemo(
        () => BigNutils(quote.amountIn).toHuman(quote.fromToken.decimals).toTokenFormat_string(6, formatLocale),
        [quote.amountIn, quote.fromToken.decimals, formatLocale],
    )

    const formattedAmountOut = useMemo(
        () => BigNutils(quote.amountOut).toHuman(quote.toToken.decimals).toTokenFormat_string(6, formatLocale),
        [quote.amountOut, quote.toToken.decimals, formatLocale],
    )

    const formattedFee = useMemo(
        () => BigNutils(quote.feeAmount).toHuman(quote.fromToken.decimals).toTokenFormat_string(6, formatLocale),
        [quote.feeAmount, quote.fromToken.decimals, formatLocale],
    )

    const formattedMinReceived = useMemo(
        () => BigNutils(quote.amountOutMin).toHuman(quote.toToken.decimals).toTokenFormat_string(6, formatLocale),
        [quote.amountOutMin, quote.toToken.decimals, formatLocale],
    )

    const onTransactionSuccess = useCallback(
        (_transaction: Transaction, txId: string) => {
            track(AnalyticsEvent.SWAP_SUCCESS, {
                fromToken: quote.fromToken.symbol,
                toToken: quote.toToken.symbol,
                amountIn: formattedAmountIn,
                amountOut: formattedAmountOut,
                dexId: quote.dexId,
                feeAmount: formattedFee,
                txId,
            })

            navigation.navigate(Routes.HOME)
            dispatch(setIsAppLoading(false))
        },
        [track, quote, formattedAmountIn, formattedAmountOut, formattedFee, navigation, dispatch],
    )

    const onTransactionFailure = useCallback(
        (error: unknown) => {
            track(AnalyticsEvent.SWAP_FAILED, {
                fromToken: quote.fromToken.symbol,
                toToken: quote.toToken.symbol,
                amountIn: formattedAmountIn,
                dexId: quote.dexId,
                error: String(error),
            })
        },
        [track, quote, formattedAmountIn],
    )

    const {
        selectedDelegationOption,
        onSubmit,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        setSelectedFeeOption,
        selectedFeeOption,
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDisabledButtonState,
        gasOptions,
        gasUpdatedAt,
        isGalactica,
        isBaseFeeRampingUp,
        speedChangeEnabled,
        isEnoughGas,
        availableTokens,
        selectedDelegationToken,
        setSelectedDelegationToken,
        hasEnoughBalanceOnAny,
        isFirstTimeLoadingFees,
        hasEnoughBalanceOnToken,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
    })

    const handleSubmit = useCallback(() => {
        track(AnalyticsEvent.SWAP_SUBMITTED, {
            fromToken: quote.fromToken.symbol,
            toToken: quote.toToken.symbol,
            amountIn: formattedAmountIn,
            amountOut: formattedAmountOut,
            dexId: quote.dexId,
            feeAmount: formattedFee,
            slippage: quote.slippageBasisPoints,
        })
        onSubmit()
    }, [track, quote, formattedAmountIn, formattedAmountOut, formattedFee, onSubmit])

    return (
        <Layout
            title={LL.SWAP_NATIVE_CONFIRM_SWAP()}
            noStaticBottomPadding
            body={
                <BaseView mb={80} mt={8}>
                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
                    />

                    <SwapConfirmationCard
                        quote={quote}
                        formattedAmountIn={formattedAmountIn}
                        formattedAmountOut={formattedAmountOut}
                        formattedFee={formattedFee}
                        formattedMinReceived={formattedMinReceived}
                    />

                    <BaseSpacer height={16} />

                    <GasFeeSpeed
                        gasUpdatedAt={gasUpdatedAt}
                        options={gasOptions}
                        selectedFeeOption={selectedFeeOption}
                        setSelectedFeeOption={setSelectedFeeOption}
                        isGalactica={isGalactica}
                        isBaseFeeRampingUp={isBaseFeeRampingUp}
                        speedChangeEnabled={speedChangeEnabled}
                        isEnoughBalance={isEnoughGas}
                        availableDelegationTokens={availableTokens}
                        delegationToken={selectedDelegationToken}
                        setDelegationToken={setSelectedDelegationToken}
                        hasEnoughBalanceOnAny={hasEnoughBalanceOnAny}
                        isFirstTimeLoadingFees={isFirstTimeLoadingFees}
                        hasEnoughBalanceOnToken={hasEnoughBalanceOnToken}>
                        <DelegationView
                            setNoDelegation={resetDelegation}
                            selectedDelegationOption={selectedDelegationOption}
                            setSelectedDelegationAccount={setSelectedDelegationAccount}
                            selectedDelegationAccount={selectedDelegationAccount}
                            selectedDelegationUrl={selectedDelegationUrl}
                            setSelectedDelegationUrl={setSelectedDelegationUrl}
                            delegationToken={selectedDelegationToken}
                        />
                    </GasFeeSpeed>
                </BaseView>
            }
            footer={
                <FadeoutButton
                    testID="confirm-swap-button"
                    title={LL.SWAP_NATIVE_CONFIRM_SWAP().toUpperCase()}
                    action={handleSubmit}
                    disabled={isDisabledButtonState}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

type SwapConfirmationCardProps = {
    quote: SwapQuote
    formattedAmountIn: string
    formattedAmountOut: string
    formattedFee: string
    formattedMinReceived: string
}

const SwapConfirmationCard: React.FC<SwapConfirmationCardProps> = ({
    quote,
    formattedAmountIn,
    formattedAmountOut,
    formattedFee,
    formattedMinReceived,
}) => {
    const { LL } = useI18nContext()

    return (
        <BaseView>
            <BaseText typographyFont="subSubTitleSemiBold">{LL.DETAILS()}</BaseText>
            <BaseSpacer height={12} />

            <DetailRow label={LL.SWAP_NATIVE_YOU_PAY()} value={`${formattedAmountIn} ${quote.fromToken.symbol}`} />
            <DetailRow
                label={LL.SWAP_NATIVE_YOU_RECEIVE()}
                value={`${formattedAmountOut} ${quote.toToken.symbol}`}
            />
            <DetailRow label={LL.SWAP_NATIVE_QUOTE_VIA({ dex: quote.dexName })} value="" />
            <DetailRow
                label={LL.SWAP_NATIVE_FEE({ fee: "0.75" })}
                value={`${formattedFee} ${quote.fromToken.symbol}`}
            />
            <DetailRow
                label={LL.SWAP_NATIVE_MIN_RECEIVED()}
                value={`${formattedMinReceived} ${quote.toToken.symbol}`}
            />
            <DetailRow
                label={LL.SWAP_NATIVE_PRICE_IMPACT()}
                value={`${quote.priceImpact.toFixed(2)}%`}
            />
        </BaseView>
    )
}

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <BaseView flexDirection="row" justifyContent="space-between" py={6}>
        <BaseText typographyFont="caption">{label}</BaseText>
        {value !== "" && <BaseText typographyFont="captionSemiBold">{value}</BaseText>}
    </BaseView>
)
