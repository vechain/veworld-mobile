import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { AlertInline, BaseView } from "~Components"
import { AlertStatus } from "~Components/Reusable/Alert/utils/AlertConfigs"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { TokenReceiverCard } from "./Components/TokenReceiverCard"
import { TransactionFeeCard } from "./Components/TransactionFeeCard"
import { SendFlowHeader } from "../SendFlowHeader"

type SummaryScreenProps = {
    token: FungibleTokenWithBalance
    amount: string
    address: string
    onTxFinished: (success: boolean) => void
    onBindTransactionControls: (controls: { onSubmit: () => void; isDisabledButtonState: boolean }) => void
    txError: boolean
    /**
     * Exchange rate used in the previous step (select amount) to price the transaction.
     * Used as the baseline to detect market-driven price updates on the summary step.
     */
    initialExchangeRate: number | null
}

export const SummaryScreen = ({
    token,
    amount,
    address,
    onTxFinished,
    onBindTransactionControls,
    txError,
    initialExchangeRate,
}: SummaryScreenProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const currency = useAppSelector(selectCurrency)

    const exchangeRateId = useMemo(() => getCoinGeckoIdBySymbol[token.symbol], [token.symbol])

    const { data: exchangeRate } = useExchangeRate({
        id: exchangeRateId,
        vs_currency: currency,
        refetchIntervalMs: 20000,
    })

    const [priceUpdated, setPriceUpdated] = useState(false)
    const [hasGasAdjustment, setHasGasAdjustment] = useState(false)

    const handleGasAdjusted = useCallback(() => {
        setHasGasAdjustment(true)
    }, [])

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

    return (
        <Animated.View style={styles.root}>
            <SendFlowHeader step="summary" />
            <TokenReceiverCard token={token} amount={amount} address={address} />
            <TransactionFeeCard
                token={token}
                amount={amount}
                address={address}
                onTxFinished={onTxFinished}
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
        },
    })
