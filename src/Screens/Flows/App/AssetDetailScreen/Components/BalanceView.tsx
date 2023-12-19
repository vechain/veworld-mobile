import React from "react"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"

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

    const { symbol, fiatBalance, exchangeRateCurrency, tokenUnitBalance, exchangeRateLoading } = tokenWithInfo

    const isLoading = exchangeRateLoading || isTokensOwnedLoading

    return (
        <BaseView w={100}>
            <BaseView flexDirection="row" alignItems="flex-end">
                <BaseText typographyFont="bodyBold">{LL.BD_YOUR_BALANCE()}</BaseText>
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
                ) : (
                    <BaseText typographyFont="caption">{`${
                        isBalanceVisible ? fiatBalance : "•••"
                    } ${exchangeRateCurrency}`}</BaseText>
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
                    <BaseText>{isBalanceVisible ? tokenUnitBalance : "•••••"}</BaseText>
                )}
                <BaseSpacer width={4} />
                <BaseText typographyFont="bodyBold">{symbol}</BaseText>
            </BaseView>
        </BaseView>
    )
}
