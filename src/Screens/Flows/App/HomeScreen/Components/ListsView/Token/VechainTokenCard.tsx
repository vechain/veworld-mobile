import React, { memo, useMemo } from "react"
import { FlexAlignType } from "react-native"
import { BaseSkeleton, BaseText, BaseView, FiatBalance } from "~Components"
import { COLORS } from "~Constants"
import { TokenWithCompleteInfo, useTheme, useTokenCardFiatInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BaseTokenCard } from "./BaseTokenCard"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"

type Props = {
    tokenWithInfo: TokenWithCompleteInfo
    isAnimation: boolean
    isBalanceVisible: boolean
    alignWithFiatBalance?: FlexAlignType
}

export const VechainTokenCard = memo(
    ({ tokenWithInfo, isAnimation, isBalanceVisible, alignWithFiatBalance }: Props) => {
        const theme = useTheme()
        const { LL } = useI18nContext()
        const { change24h, isTokensOwnedLoading, fiatBalance, exchangeRate, isPositive24hChange, isLoading } =
            useTokenCardFiatInfo(tokenWithInfo)

        const tokenValueLabelColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_800

        const renderFiatBalance = useMemo(() => {
            if (isTokensOwnedLoading)
                return (
                    <BaseView flexDirection="row" alignItems="center">
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={14}
                            width={60}
                        />
                    </BaseView>
                )
            if (!exchangeRate)
                return <BaseText typographyFont="bodyBold">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>
            return (
                <FiatBalance
                    typographyFont="subSubTitleSemiBold"
                    color={tokenValueLabelColor}
                    balances={[fiatBalance]}
                    isVisible={isBalanceVisible}
                />
            )
        }, [
            isTokensOwnedLoading,
            theme.colors.skeletonBoneColor,
            theme.colors.skeletonHighlightColor,
            exchangeRate,
            LL,
            tokenValueLabelColor,
            fiatBalance,
            isBalanceVisible,
        ])

        return (
            <BaseTokenCard
                icon={tokenWithInfo.icon}
                symbol={tokenWithInfo.symbol}
                isLoading={isLoading}
                isBalanceVisible={isBalanceVisible}
                tokenBalance={tokenWithInfo.tokenUnitBalance}
                alignWithFiatBalance={alignWithFiatBalance}
                rightContent={
                    <TokenCardBalanceInfo
                        isAnimation={isAnimation}
                        renderFiatBalance={renderFiatBalance}
                        isLoading={isLoading}
                        isPositive24hChange={isPositive24hChange}
                        change24h={change24h}
                    />
                }
            />
        )
    },
)
