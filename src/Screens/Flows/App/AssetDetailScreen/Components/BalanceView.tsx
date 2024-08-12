import React, { useCallback } from "react"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import FiatBalance from "../../HomeScreen/Components/AccountCard/FiatBalance"

export const BalanceView = ({
    tokenWithInfo,
    isBalanceVisible,
}: {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
}) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const { symbol, fiatBalance, exchangeRate, tokenUnitFullBalance, exchangeRateLoading } = tokenWithInfo

    const isLoading = exchangeRateLoading || isTokensOwnedLoading
    const priceFeedNotAvailable = !exchangeRate || isLoading

    const renderFiatBalance = useCallback(() => {
        if (isLoading)
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
        if (priceFeedNotAvailable)
            return <BaseText typographyFont="bodyMedium">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>
        return (
            <BaseView flexDirection="row">
                <FiatBalance
                    typographyFont={"subTitleBold"}
                    color={theme.colors.text}
                    balances={[fiatBalance]}
                    isVisible={isBalanceVisible}
                />
            </BaseView>
        )
    }, [fiatBalance, LL, isBalanceVisible, isLoading, priceFeedNotAvailable, theme.colors])

    return (
        <BaseView w={100}>
            <BaseView flexDirection="row" alignItems="flex-end">
                <BaseText typographyFont="bodyBold">{LL.BD_YOUR_BALANCE()}</BaseText>
            </BaseView>

            <BaseSpacer height={4} />

            <BaseView flexDirection="row" justifyContent="space-between">
                <BaseView flexDirection="row">
                    {isTokensOwnedLoading ? (
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={14}
                            width={60}
                        />
                    ) : (
                        <BaseText typographyFont="bodyMedium">
                            {isBalanceVisible ? tokenUnitFullBalance : "•••••"}
                        </BaseText>
                    )}
                    <BaseSpacer width={4} />
                    <BaseText typographyFont="captionRegular">{symbol}</BaseText>
                </BaseView>
                <BaseSpacer width={4} />
                {renderFiatBalance()}
            </BaseView>
        </BaseView>
    )
}
