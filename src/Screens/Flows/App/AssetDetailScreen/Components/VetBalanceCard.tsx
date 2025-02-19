import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useTokenCardFiatInfo } from "~Screens/Flows/App/HomeScreen/Components/ListsView/Token/useTokenCardFiatInfo"
import React, { useMemo } from "react"
import { BaseSkeleton, BaseText, BaseView } from "~Components"
import { StyleSheet } from "react-native"
import { BalanceView } from "./BalanceView"

type Props = {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
    FastActions: React.ReactNode
}

export const VetBalanceCard = ({ tokenWithInfo, isBalanceVisible, FastActions }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()

    const { change24h, exchangeRate, isPositive24hChange, isLoading } = useTokenCardFiatInfo(tokenWithInfo)

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
            <BalanceView
                isBalanceVisible={isBalanceVisible}
                tokenWithInfo={tokenWithInfo}
                change24h={change24h}
                isPositiveChange={isPositive24hChange}
            />
        )
    }, [
        isLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        exchangeRate,
        LL,
        isBalanceVisible,
        tokenWithInfo,
        change24h,
        isPositive24hChange,
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
            gap: 16,
        },
    })
