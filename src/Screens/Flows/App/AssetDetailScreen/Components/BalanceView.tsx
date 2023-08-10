import React from "react"
import { useBalances, useTheme } from "~Hooks"
import { TokenWithCompleteInfo } from "~Model"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import {
    selectCurrency,
    selectIsTokensOwnedLoading,
    useAppSelector,
} from "~Storage/Redux"

export const BalanceView = ({
    token,
    isBalanceVisible,
}: {
    token: TokenWithCompleteInfo
    isBalanceVisible: boolean
}) => {
    const { LL } = useI18nContext()
    const { fiatBalance, tokenUnitBalance } = useBalances({ token })
    const currency = useAppSelector(selectCurrency)

    const theme = useTheme()

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    return (
        <BaseView w={100}>
            <BaseView flexDirection="row" alignItems="flex-end">
                <BaseText typographyFont="bodyBold">
                    {LL.BD_YOUR_BALANCE()}
                </BaseText>
                <BaseSpacer width={4} />
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
