import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { AlertInline, BaseView, useSendContext } from "~Components"
import { AlertStatus } from "~Components/Reusable/Alert/utils/AlertConfigs"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"
import { useNavigation } from "@react-navigation/native"
import { RootStackParamListHome, Routes } from "~Navigation"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { TokenReceiverCard } from "./Components/TokenReceiverCard"
import { TransactionFeeCard } from "./Components/TransactionFeeCard"
import { SendFlowHeader } from "../SendFlowHeader"

type SummaryScreenProps = {
    onBindTransactionControls: (controls: { onSubmit: () => void; isDisabledButtonState: boolean }) => void
}

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

export const SummaryScreen = ({ onBindTransactionControls }: SummaryScreenProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const { flowState, txError, setTxError } = useSendContext()
    const currency = useAppSelector(selectCurrency)
    const { formatLocale } = useFormatFiat()

    const { token, amount, address, fiatAmount, amountInFiat, initialExchangeRate } = flowState

    const exchangeRateId = useMemo(() => (token ? getCoinGeckoIdBySymbol[token.symbol] : undefined), [token])

    const { data: exchangeRate } = useExchangeRate({
        id: exchangeRateId,
        vs_currency: currency,
        refetchIntervalMs: 20000,
    })

    const [priceUpdated, setPriceUpdated] = useState(false)
    const [hasGasAdjustment, setHasGasAdjustment] = useState(false)

    const { displayTokenAmount, displayFiatAmount } = useMemo(() => {
        if (!exchangeRate) {
            return {
                displayTokenAmount: amount ?? "0",
                displayFiatAmount: fiatAmount,
            }
        }

        if (amountInFiat && fiatAmount != null) {
            const nextTokenAmount = BigNutils().toTokenConversion(fiatAmount, exchangeRate).toString

            return {
                displayTokenAmount: nextTokenAmount,
                displayFiatAmount: fiatAmount,
            }
        }

        const sourceAmount = amount ?? "0"
        const { value } = BigNutils().toCurrencyConversion(sourceAmount, exchangeRate)

        return {
            displayTokenAmount: sourceAmount,
            displayFiatAmount: value,
        }
    }, [amount, amountInFiat, exchangeRate, fiatAmount])

    const handleGasAdjusted = useCallback(() => {
        setHasGasAdjustment(true)
    }, [])

    const handleTxFinished = useCallback(
        (success: boolean) => {
            if (success) {
                if (txError) {
                    setTxError(false)
                }
                navigation.navigate(Routes.HOME)
                return
            }

            if (!txError) {
                setTxError(true)
            }
        },
        [navigation, setTxError, txError],
    )

    const alertConfig = useMemo<null | { message: string; status: AlertStatus }>(() => {
        if (txError) {
            return {
                message: LL.COMMON_ALERT_TRANSACTION_FAILED(),
                status: "error",
            }
        }

        if (hasGasAdjustment) {
            return {
                message: LL.COMMON_ALERT_TOKEN_AMOUNT_ADJUSTED_FOR_FEE(),
                status: "info",
            }
        }

        if (priceUpdated) {
            return {
                message: LL.COMMON_ALERT_DISPLAYED_AMOUNTS_UPDATED(),
                status: "info",
            }
        }

        return null
    }, [LL, hasGasAdjustment, priceUpdated, txError])

    // Track latest exchange rate vs the one used in the previous step to detect market price updates
    useEffect(() => {
        if (exchangeRate == null || initialExchangeRate == null) return

        if (!priceUpdated && exchangeRate !== initialExchangeRate) {
            setPriceUpdated(true)
        }
    }, [exchangeRate, initialExchangeRate, priceUpdated])

    const formattedFiatAmount = useMemo(() => {
        if (displayFiatAmount == null) return undefined

        const trimmed = displayFiatAmount.trim()
        // Preserve special "< 0.01" style strings
        if (trimmed.startsWith("<")) return trimmed

        return formatFullPrecision(trimmed, {
            locale: formatLocale,
            forceDecimals: 2,
        })
    }, [displayFiatAmount, formatLocale])

    if (!token || !address) {
        return <BaseView flex={1} />
    }

    return (
        <Animated.View style={styles.root}>
            <SendFlowHeader step="summary" />
            <TokenReceiverCard
                token={token}
                amount={displayTokenAmount}
                address={address}
                fiatAmount={formattedFiatAmount}
                amountInFiat={Boolean(amountInFiat)}
            />
            <TransactionFeeCard
                token={token}
                amount={displayTokenAmount}
                address={address}
                onTxFinished={handleTxFinished}
                onBindTransactionControls={onBindTransactionControls}
                onGasAdjusted={handleGasAdjusted}
            />

            {alertConfig && (
                <BaseView>
                    <AlertInline message={alertConfig.message} status={alertConfig.status} variant="banner" />
                </BaseView>
            )}
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            flexDirection: "column",
            gap: 16,
            paddingHorizontal: 16,
        },
    })
