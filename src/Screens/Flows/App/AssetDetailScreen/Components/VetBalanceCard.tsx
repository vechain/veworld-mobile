import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useTokenCardFiatInfo } from "~Screens/Flows/App/HomeScreen/Components/ListsView/Token/useTokenCardFiatInfo"
import React, { useMemo } from "react"
import { BaseSkeleton, BaseText, BaseView, FiatBalance } from "~Components"
import { StyleSheet } from "react-native"

type Props = {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
    FastActions: React.ReactNode
}

export const VetBalanceCard = ({ tokenWithInfo, isBalanceVisible, FastActions }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()

    const { change24h, fiatBalance, exchangeRate, isPositive24hChange, isLoading } = useTokenCardFiatInfo(tokenWithInfo)

    const renderFiatBalance = useMemo(() => {
        if (isLoading)
            return (
                <BaseView flexDirection="row">
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={14}
                        width={60}
                    />
                </BaseView>
            )
        if (!exchangeRate) return <BaseText typographyFont="bodyMedium">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>

        return (
            <>
                <FiatBalance
                    typographyFont={"subSubTitleSemiBold"}
                    color={theme.colors.assetDetailsCard.title}
                    balances={[fiatBalance.toString()]}
                    isVisible={isBalanceVisible}
                />
                <BaseText
                    typographyFont="captionMedium"
                    color={isPositive24hChange ? theme.colors.positive : theme.colors.negative}>
                    {change24h}
                </BaseText>
            </>
        )
    }, [
        isLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        theme.colors.assetDetailsCard.title,
        theme.colors.positive,
        theme.colors.negative,
        exchangeRate,
        LL,
        fiatBalance,
        isBalanceVisible,
        isPositive24hChange,
        change24h,
    ])

    return (
        <BaseView style={styles.nonVbdContainer}>
            {renderFiatBalance}
            {FastActions}
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        nonVbdContainer: {
            paddingHorizontal: 16,
        },
    })
