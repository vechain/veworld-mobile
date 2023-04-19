import { ViewProps } from "react-native"
import React, { memo, useMemo } from "react"
import { TokenWithExchangeRate } from "~Model"
import { FormattingUtils } from "~Common"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { OfficialTokenCard } from "./OfficialTokenCard"

type OfficialTokenCardWithExchangeRateProps = {
    token: TokenWithExchangeRate
    action: () => void
} & ViewProps

export const OfficialTokenCardWithExchangeRate = memo(
    ({ token, style, action }: OfficialTokenCardWithExchangeRateProps) => {
        const currency = useAppSelector(selectCurrency)
        const isPositive24hChange = useMemo(
            () => (token.change || 0) > 0,
            [token.change],
        )
        const change24h = useMemo(
            () =>
                (isPositive24hChange ? "+" : "") +
                FormattingUtils.humanNumber(token.change || 0) +
                "%",
            [isPositive24hChange, token.change],
        )

        return (
            <OfficialTokenCard
                token={token}
                action={action}
                style={style}
                currency={currency}
                change24h={change24h}
                isPositive24hChange={isPositive24hChange}
            />
        )
    },
)
