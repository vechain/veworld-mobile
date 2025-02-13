import React, { useCallback } from "react"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView, FiatBalance } from "~Components"
import { useI18nContext } from "~i18n"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { Image, StyleSheet } from "react-native"
import { COLORS } from "~Constants"

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

    const { symbol, fiatBalance, exchangeRate, tokenUnitBalance, exchangeRateLoading } = tokenWithInfo

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
                    typographyFont={"subTitleSemiBold"}
                    color={theme.colors.assetDetailsCard.title}
                    balances={[fiatBalance]}
                    isVisible={isBalanceVisible}
                />
            </BaseView>
        )
    }, [fiatBalance, LL, isBalanceVisible, isLoading, priceFeedNotAvailable, theme.colors])

    return (
        <BaseView w={100}>
            <BaseView flexDirection="row" alignItems="center" justifyContent="flex-start">
                <BaseText color={theme.colors.subtitle} typographyFont="captionSemiBold">
                    {LL.BD_YOUR_BALANCE()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={8} />

            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                <BaseView flexDirection="row" alignItems="center" justifyContent="flex-start">
                    <BaseView style={[styles.imageContainer]}>
                        <Image source={{ uri: tokenWithInfo.icon }} style={styles.image} />
                    </BaseView>
                    <BaseSpacer width={8} />
                    <BaseText color={theme.colors.assetDetailsCard.title} typographyFont="subSubTitleSemiBold">
                        {symbol}
                    </BaseText>
                    <BaseSpacer width={4} />
                    {isTokensOwnedLoading ? (
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={14}
                            width={60}
                        />
                    ) : (
                        <BaseText color={theme.colors.assetDetailsCard.text} typographyFont="subSubTitleMedium">
                            {isBalanceVisible ? tokenUnitBalance : "•••••"}
                        </BaseText>
                    )}
                </BaseView>
                <BaseSpacer width={4} />
                {renderFiatBalance()}
            </BaseView>
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
    image: { width: 14, height: 14 },
})
