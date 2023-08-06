import React from "react"
import { useBalances, useTheme } from "~Hooks"
import { TokenWithCompleteInfo } from "~Model"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import {
    selectCurrency,
    selectIsTokensOwnedLoading,
    useAppSelector,
} from "~Storage/Redux"
import SkeletonContent from "react-native-skeleton-content-nonexpo"
import { StyleSheet } from "react-native"

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
                        <SkeletonContent
                            containerStyle={baseStyles.skeletonBalanceValue}
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            layout={[
                                {
                                    flexDirection: "row",
                                    alignItems: "center",
                                    children: [
                                        // Line
                                        {
                                            width: "100%",
                                            height: 14,
                                        },
                                    ],
                                },
                            ]}
                            isLoading={true}
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
                        <SkeletonContent
                            containerStyle={baseStyles.skeletonBalanceValue}
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            layout={[
                                {
                                    flexDirection: "row",
                                    alignItems: "center",
                                    children: [
                                        // Line
                                        {
                                            width: "100%",
                                            height: 14,
                                        },
                                    ],
                                },
                            ]}
                            isLoading={true}
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

const baseStyles = StyleSheet.create({
    skeletonBalanceValue: {
        width: 60,
    },
})
