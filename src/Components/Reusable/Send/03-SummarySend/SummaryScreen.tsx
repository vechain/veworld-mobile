import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { useInterval } from "usehooks-ts"
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
}

export const SummaryScreen = ({
    token,
    amount,
    address,
    onTxFinished,
    onBindTransactionControls,
    txError,
}: SummaryScreenProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const currency = useAppSelector(selectCurrency)

    const exchangeRateId = useMemo(() => getCoinGeckoIdBySymbol[token.symbol], [token.symbol])

    const { data: exchangeRate, refetch } = useExchangeRate({
        id: exchangeRateId,
        vs_currency: currency,
    })

    const [initialExchangeRate, setInitialExchangeRate] = useState<number | null>(null)
    const [priceUpdated, setPriceUpdated] = useState(false)
    const [hasGasAdjustment, setHasGasAdjustment] = useState(false)

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

    // Track initial vs latest exchange rate to detect market price updates
    useEffect(() => {
        if (exchangeRate == null) return

        if (initialExchangeRate === null) {
            setInitialExchangeRate(exchangeRate)
            return
        }

        if (!priceUpdated && exchangeRate !== initialExchangeRate) {
            setPriceUpdated(true)
        }
    }, [exchangeRate, initialExchangeRate, priceUpdated])

    // Periodically refetch exchange rate so we can compare every 20 seconds
    useInterval(() => {
        refetch()
    }, 20000)

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
                onGasAdjusted={() => setHasGasAdjustment(true)}
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
