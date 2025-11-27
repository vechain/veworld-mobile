import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { useInterval } from "usehooks-ts"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { AlertInline, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { TokenReceiverCard } from "./Components/TokenReceiverCard"
import { TransactionFeeCard } from "./Components/TransactionFeeCard"

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
            <TokenReceiverCard token={token} amount={amount} address={address} />
            <TransactionFeeCard
                token={token}
                amount={amount}
                address={address}
                onTxFinished={onTxFinished}
                onBindTransactionControls={onBindTransactionControls}
                onGasAdjusted={() => setHasGasAdjustment(true)}
            />

            {(priceUpdated || hasGasAdjustment || txError) && (
                <BaseView>
                    {txError ? (
                        <AlertInline message={LL.COMMON_ALERT_TRANSACTION_FAILED()} status="error" variant="banner" />
                    ) : hasGasAdjustment ? (
                        <AlertInline
                            message={LL.COMMON_ALERT_TOKEN_AMOUNT_ADJUSTED_FOR_FEE()}
                            status="info"
                            variant="banner"
                        />
                    ) : (
                        <AlertInline
                            message={LL.COMMON_ALERT_DISPLAYED_AMOUNTS_UPDATED()}
                            status="info"
                            variant="banner"
                        />
                    )}
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
            gap: 32,
        },
    })
