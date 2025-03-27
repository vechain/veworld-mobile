import React, { useCallback, useMemo } from "react"
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { BaseSkeleton, BaseText, BaseView, FiatBalance } from "~Components"
import { B3TR, VOT3 } from "~Constants"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"

export const BalanceView = ({
    tokenWithInfo,
    isBalanceVisible,
    change24h,
    isPositiveChange,
    containerStyle,
}: {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
    change24h?: string
    isPositiveChange?: boolean
    containerStyle?: StyleProp<ViewStyle>
}) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const { symbol, fiatBalance, exchangeRate, tokenUnitBalance, exchangeRateLoading } = tokenWithInfo

    const isLoading = exchangeRateLoading || isTokensOwnedLoading
    const priceFeedNotAvailable = !exchangeRate || isLoading

    const isVBDToken = useMemo(
        () => tokenWithInfo.symbol === B3TR.symbol || tokenWithInfo.symbol === VOT3.symbol,
        [tokenWithInfo.symbol],
    )

    const show24hChange = useMemo(() => !!(Number(fiatBalance) && change24h), [change24h, fiatBalance])

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
            <BaseView flexDirection="column" alignItems={isVBDToken ? "center" : "flex-end"}>
                <FiatBalance
                    typographyFont={"bodyMedium"}
                    color={theme.colors.assetDetailsCard.text}
                    balances={[fiatBalance]}
                    isVisible={isBalanceVisible}
                />
                {show24hChange && (
                    <BaseText
                        mt={2}
                        typographyFont="captionMedium"
                        color={isPositiveChange ? theme.colors.positive : theme.colors.negative}>
                        {change24h}
                    </BaseText>
                )}
            </BaseView>
        )
    }, [
        isLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        theme.colors.assetDetailsCard.text,
        theme.colors.positive,
        theme.colors.negative,
        priceFeedNotAvailable,
        LL,
        isVBDToken,
        fiatBalance,
        isBalanceVisible,
        show24hChange,
        isPositiveChange,
        change24h,
    ])

    return (
        <BaseView style={containerStyle ?? styles.layout}>
            <BaseView style={styles.balanceContainer}>
                <BaseView style={[styles.imageContainer]}>
                    <Image source={{ uri: tokenWithInfo.icon }} style={styles.image} />
                </BaseView>
                <BaseText color={theme.colors.assetDetailsCard.title} typographyFont="subSubTitleSemiBold">
                    {symbol}
                </BaseText>
                {isTokensOwnedLoading ? (
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={14}
                        width={60}
                    />
                ) : (
                    <BaseText color={theme.colors.assetDetailsCard.title} typographyFont="subSubTitleSemiBold">
                        {isBalanceVisible ? tokenUnitBalance : "•••••"}
                    </BaseText>
                )}
            </BaseView>
            {renderFiatBalance()}
        </BaseView>
    )
}

const styles = StyleSheet.create({
    imageContainer: {
        borderRadius: 30,
        overflow: "hidden",
    },
    imageShadow: {
        width: "auto",
    },
    image: { width: 24, height: 24 },
    balanceContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4,
    },
    layout: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    vbdFiat: {
        justifyContent: "flex-start",
    },
})
