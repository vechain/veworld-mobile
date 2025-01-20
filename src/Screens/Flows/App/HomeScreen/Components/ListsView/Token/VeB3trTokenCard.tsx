import { Image, StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText, BaseView, BaseSpacer, BaseSkeleton, FiatBalance } from "~Components"
import Animated from "react-native-reanimated"
import { useTheme, useTokenWithCompleteInfo } from "~Hooks"
import { BalanceUtils } from "~Utils"
import { B3TR, COLORS, VOT3 } from "~Constants"
import { useTokenCardFiatInfo } from "./useTokenCardFiatInfo"
import { useI18nContext } from "~i18n"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"
import { selectBalanceForToken, useAppSelector } from "~Storage/Redux"

type Props = {
    isBalanceVisible: boolean
}

export const VeB3trTokenCard = memo(({ isBalanceVisible }: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const vot3Token = useTokenWithCompleteInfo(VOT3)
    const b3trToken = useTokenWithCompleteInfo(B3TR)

    const vot3RawBalance = useAppSelector(state => selectBalanceForToken(state, VOT3.address))

    const {
        isTokensOwnedLoading,
        exchangeRate,
        isPositive24hChange,
        change24h,
        isLoading,
        fiatBalance: b3trFiat,
    } = useTokenCardFiatInfo(b3trToken)

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        exchangeRate ?? 0,
        VOT3.decimals,
    )

    const veB3trFiatBalance = Number(vot3FiatBalance) + Number(b3trFiat)

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
        if (!exchangeRate) return <BaseText typographyFont="bodyMedium">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>

        return (
            <FiatBalance
                typographyFont="captionRegular"
                color={theme.colors.tokenCardText}
                balances={[veB3trFiatBalance.toString()]}
                isVisible={isBalanceVisible}
            />
        )
    }, [
        isTokensOwnedLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        theme.colors.tokenCardText,
        exchangeRate,
        LL,
        veB3trFiatBalance,
        isBalanceVisible,
    ])

    const tokenValueLabelColor = theme.isDark ? COLORS.PRIMARY_200 : COLORS.GREY_500

    return (
        <Animated.View style={[baseStyles.innerRow]}>
            <BaseView flexDirection="row">
                <BaseView style={[baseStyles.imageContainer]}>
                    <Image source={{ uri: b3trToken.icon }} style={baseStyles.image} />
                </BaseView>
                <BaseSpacer width={12} />
                <BaseView flexDirection="column" alignItems="flex-start">
                    <BaseView flexDirection="row">
                        <BaseView style={baseStyles.tokenSymbol}>
                            <BaseText typographyFont="captionSemiBold">{b3trToken.symbol}</BaseText>
                        </BaseView>
                        <BaseSpacer width={4} />
                        {isLoading ? (
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                                height={12}
                                width={40}
                            />
                        ) : (
                            <BaseText typographyFont="captionRegular" align="left" color={tokenValueLabelColor}>
                                {isBalanceVisible ? b3trToken.tokenUnitBalance : "•••••"}
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseSpacer height={2} />
                    <BaseView flexDirection="row">
                        <BaseView style={baseStyles.tokenSymbol}>
                            <BaseText typographyFont="captionSemiBold">{vot3Token.symbol}</BaseText>
                        </BaseView>
                        <BaseSpacer width={4} />
                        {isLoading ? (
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                                height={12}
                                width={40}
                            />
                        ) : (
                            <BaseText typographyFont="captionRegular" align="left" color={tokenValueLabelColor}>
                                {isBalanceVisible ? vot3Token.tokenUnitBalance : "•••••"}
                            </BaseText>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
            <TokenCardBalanceInfo
                renderFiatBalance={renderFiatBalance}
                isLoading={isLoading}
                isPositive24hChange={isPositive24hChange}
                change24h={change24h}
            />
        </Animated.View>
    )
})

const baseStyles = StyleSheet.create({
    tokenSymbol: {
        width: 36,
    },
    imageContainer: {
        borderRadius: 30,
        padding: 9,
        backgroundColor: COLORS.GREY_50,
    },
    imageShadow: {
        width: "auto",
    },
    image: { width: 14, height: 14 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        flexGrow: 1,
    },
    balancesContainer: {
        alignItems: "flex-end",
    },
})
