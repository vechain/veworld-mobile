import React, { useCallback, useMemo } from "react"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { BaseSkeleton, BaseText, BaseView, FiatBalance } from "~Components"
import { useI18nContext } from "~i18n"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { B3TR, COLORS, VOT3 } from "~Constants"

export const BalanceView = ({
    tokenWithInfo,
    isBalanceVisible,
    containerStyle,
}: {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
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
                    typographyFont={"bodySemiBold"}
                    color={theme.colors.assetDetailsCard.text}
                    balances={[fiatBalance]}
                    isVisible={isBalanceVisible}
                />
            </BaseView>
        )
    }, [fiatBalance, LL, isBalanceVisible, isLoading, priceFeedNotAvailable, theme.colors])

    return (
        <BaseView style={containerStyle ?? styles.layout}>
            <BaseView style={styles.balanceContainer}>
                <BaseView style={[!isVBDToken && styles.imageContainer]}>
                    <Image source={{ uri: tokenWithInfo.icon }} style={isVBDToken ? styles.vbdImage : styles.image} />
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
        padding: 6,
        backgroundColor: COLORS.GREY_100,
    },
    imageShadow: {
        width: "auto",
    },
    image: { width: 12, height: 12 },
    vbdImage: { width: 24, height: 24 },
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
})
