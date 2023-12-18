import { ViewProps } from "react-native"
import React, { memo } from "react"
import { OfficialTokenCard } from "./OfficialTokenCard"
import { FungibleToken } from "~Model"
import { useTokenWithCompleteInfo } from "~Hooks"

type OfficialTokenCardWithExchangeRateProps = {
    token: FungibleToken
    action: () => void
} & ViewProps

export const OfficialTokenCardWithExchangeRate = memo(
    ({ token, style, action }: OfficialTokenCardWithExchangeRateProps) => {
        const { exchangeRateCurrency, tokenInfo } =
            useTokenWithCompleteInfo(token)

        const change24h = tokenInfo?.market_data.price_change_percentage_24h
        const isPositive24hChange = (change24h ?? 0) > 0

        return (
            <OfficialTokenCard
                token={token}
                action={action}
                iconHeight={20}
                iconWidth={20}
                style={style}
                currency={exchangeRateCurrency}
                change24h={change24h?.toString()}
                isPositive24hChange={isPositive24hChange}
            />
        )
    },
)
