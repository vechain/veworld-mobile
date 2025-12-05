import React, { useEffect, useMemo, useState } from "react"
import { AlertInline, BaseView, useSendContext } from "~Components"
import { AlertStatus } from "~Components/Reusable/Alert/utils/AlertConfigs"
import { useI18nContext } from "~i18n"
import { useCurrentExchangeRate } from "../Hooks"

type Props = {
    txError: boolean
    hasGasAdjustment: boolean
}

export const TransactionAlert = ({ txError, hasGasAdjustment }: Props) => {
    const { LL } = useI18nContext()
    const { flowState } = useSendContext()
    const [priceUpdated, setPriceUpdated] = useState(false)
    const { data: exchangeRate } = useCurrentExchangeRate()

    // Track latest exchange rate vs the one used in the previous step to detect market price updates
    useEffect(() => {
        if (exchangeRate == null || flowState.initialExchangeRate == null) return

        if (!priceUpdated && exchangeRate !== flowState.initialExchangeRate) {
            setPriceUpdated(true)
        }
    }, [exchangeRate, flowState.initialExchangeRate, priceUpdated])

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
