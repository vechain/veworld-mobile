import React, { useEffect, useMemo, useState } from "react"
import { AlertInline, BaseView } from "~Components"
import { AlertStatus } from "~Components/Reusable/Alert/utils/AlertConfigs"
import { useI18nContext } from "~i18n"
import { useTokenSendContext } from "../../Provider"
import { useCurrentExchangeRate } from "../Hooks"
import BalanceUtils from "~Utils/BalanceUtils"

type Props = {
    txError: boolean
    hasGasAdjustment: boolean
}

export const TransactionAlert = ({ txError, hasGasAdjustment }: Props) => {
    const { LL } = useI18nContext()
    const { flowState } = useTokenSendContext()
    const [priceUpdated, setPriceUpdated] = useState(false)
    const { data: exchangeRate } = useCurrentExchangeRate()

    const currentFiatAmount = useMemo(() => {
        return BalanceUtils.getPreciseFiatBalance(
            flowState.amount ?? "0",
            exchangeRate ?? 0,
            flowState.token?.decimals ?? 18,
        )
    }, [flowState.amount, flowState.token?.decimals, exchangeRate])

    const initialFiatAmount = useMemo(() => {
        return BalanceUtils.getPreciseFiatBalance(
            flowState.amount ?? "0",
            flowState.initialExchangeRate ?? 0,
            flowState.token?.decimals ?? 18,
        )
    }, [flowState.amount, flowState.initialExchangeRate, flowState.token?.decimals])

    const hasVisiblePriceChange = useMemo(() => {
        return (
            Math.max(Number(currentFiatAmount), Number(initialFiatAmount)) -
                Math.min(Number(currentFiatAmount), Number(initialFiatAmount)) >
            0.01
        )
    }, [currentFiatAmount, initialFiatAmount])

    // Track latest exchange rate vs the one used in the previous step to detect market price updates
    useEffect(() => {
        if (exchangeRate == null || flowState.initialExchangeRate == null) return

        if (!priceUpdated && exchangeRate !== flowState.initialExchangeRate && hasVisiblePriceChange) {
            setPriceUpdated(true)
        }
    }, [exchangeRate, flowState.initialExchangeRate, priceUpdated, hasVisiblePriceChange])

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

    if (!alertConfig) return null
    return (
        <BaseView>
            <AlertInline message={alertConfig.message} status={alertConfig.status} variant="banner" />
        </BaseView>
    )
}
