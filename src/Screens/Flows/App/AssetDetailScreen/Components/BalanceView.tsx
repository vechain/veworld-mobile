import React from "react"
import { useBalances, useTheme } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import {
    selectCurrency,
    selectIsTokensOwnedLoading,
    useAppSelector,
} from "~Storage/Redux"
import { useExchangeRate } from "~Api"
import { getCoinGeckoIdBySymbol } from "~Constants"

export const BalanceView = ({
    token,
    isBalanceVisible,
}: {
    token: FungibleTokenWithBalance
    isBalanceVisible: boolean
}) => {
    const { LL } = useI18nContext()
    const currency = useAppSelector(selectCurrency)
    const theme = useTheme()

    const { data: exchangeRate, isLoading: exchangeRateLoading } =
        useExchangeRate({
            id: getCoinGeckoIdBySymbol[token.symbol],
            vs_currency: currency,
        })
    const { fiatBalance, tokenUnitBalance } = useBalances({
        token,
        exchangeRate,
    })

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)
    const isLoading = isTokensOwnedLoading || exchangeRateLoading
    const priceFeedNotAvailable = !exchangeRate || isLoading

    return (
        <BaseView w={100}>
            <BaseView flexDirection="row" alignItems="flex-end">
                <BaseText typographyFont="bodyBold">
                    {LL.BD_YOUR_BALANCE()}
                </BaseText>
                <BaseSpacer width={4} />
                {isLoading ? (
                    <BaseView flexDirection="row" alignItems="center">
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={14}
                            width={60}
                        />
                    </BaseView>
                ) : priceFeedNotAvailable ? (
                    <BaseText typographyFont="caption">
                        {LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}
                    </BaseText>
                ) : (
                    <BaseText typographyFont="caption">{`${
                        isBalanceVisible ? fiatBalance : "•••"
                    } ${currency}`}</BaseText>
                )}
            </BaseView>

            <BaseSpacer height={4} />

            <BaseView flexDirection="row">
                {isTokensOwnedLoading ? (
                    <BaseView flexDirection="row" alignItems="center">
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={14}
                            width={60}
                        />
                    </BaseView>
                ) : (
                    <BaseText>
                        {isBalanceVisible ? tokenUnitBalance : "•••••"}
                    </BaseText>
                )}
                <BaseSpacer width={4} />
                <BaseText typographyFont="bodyBold">{token.symbol}</BaseText>
            </BaseView>
        </BaseView>
    )
}
