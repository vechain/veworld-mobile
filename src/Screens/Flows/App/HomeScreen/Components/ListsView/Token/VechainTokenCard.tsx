import { Image, StyleSheet } from "react-native"
import React, { memo } from "react"
import {
    BaseText,
    BaseCard,
    BaseView,
    BaseSpacer,
    BaseSkeleton,
} from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useTheme, useTokenWithCompleteInfo } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { selectIsTokensOwnedLoading } from "~Storage/Redux/Selectors"
import { FungibleToken } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"

type Props = {
    token: FungibleToken
    isAnimation: boolean
    isBalanceVisible: boolean
}

export const VechainTokenCard = memo(
    ({ token, isAnimation, isBalanceVisible }: Props) => {
        const { LL } = useI18nContext()
        const theme = useTheme()

        const {
            fiatBalance,
            tokenUnitBalance,
            tokenInfo,
            // tokenInfoLoading,
            exchangeRate,
            exchangeRateCurrency,
            exchangeRateLoading,
        } = useTokenWithCompleteInfo(token)

        const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

        const isPositive24hChange =
            (tokenInfo?.market_data.price_change_percentage_24h ?? 0) > 0

        const change24h =
            (isPositive24hChange ? "+" : "") +
            FormattingUtils.humanNumber(
                tokenInfo?.market_data.price_change_percentage_24h ?? 0,
                tokenInfo?.market_data.price_change_percentage_24h ?? 0,
            ) +
            "%"

        const animatedOpacityReverse = useAnimatedStyle(() => {
            return {
                opacity: withTiming(isAnimation ? 0 : 1, {
                    duration: 200,
                }),
            }
        }, [isAnimation])

        const tokenValueLabelColor = theme.isDark
            ? COLORS.WHITE_DISABLED
            : COLORS.DARK_PURPLE_DISABLED

        const isLoading = isTokensOwnedLoading || exchangeRateLoading
        const priceFeedNotAvailable = !exchangeRate

        return (
            <Animated.View style={[baseStyles.innerRow]}>
                <BaseView flexDirection="row">
                    <BaseCard
                        style={[
                            baseStyles.imageContainer,
                            { backgroundColor: COLORS.WHITE },
                        ]}
                        containerStyle={baseStyles.imageShadow}>
                        <Image
                            source={{ uri: token.icon }}
                            style={baseStyles.image}
                        />
                    </BaseCard>
                    <BaseSpacer width={16} />
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">
                            {token.name}
                        </BaseText>
                        <BaseView
                            flexDirection="row"
                            alignItems="baseline"
                            justifyContent="flex-start">
                            {isLoading ? (
                                <BaseView
                                    flexDirection="row"
                                    alignItems="center">
                                    <BaseSkeleton
                                        containerStyle={
                                            baseStyles.skeletonBalance
                                        }
                                        animationDirection="horizontalLeft"
                                        boneColor={
                                            theme.colors.skeletonBoneColor
                                        }
                                        highlightColor={
                                            theme.colors.skeletonHighlightColor
                                        }
                                        height={14}
                                    />
                                    <BaseText
                                        typographyFont="captionRegular"
                                        color={tokenValueLabelColor}
                                        pl={4}>
                                        {token.symbol}
                                    </BaseText>
                                </BaseView>
                            ) : (
                                <BaseView
                                    flexDirection="row"
                                    alignItems="center">
                                    <BaseText
                                        typographyFont="bodyMedium"
                                        color={tokenValueLabelColor}>
                                        {isBalanceVisible
                                            ? tokenUnitBalance
                                            : "•••••"}{" "}
                                    </BaseText>
                                    <BaseText
                                        typographyFont="captionRegular"
                                        color={tokenValueLabelColor}>
                                        {token.symbol}
                                    </BaseText>
                                </BaseView>
                            )}
                        </BaseView>
                    </BaseView>
                </BaseView>
                <Animated.View
                    style={[
                        animatedOpacityReverse,
                        baseStyles.balancesContainer,
                    ]}>
                    <BaseView flexDirection="row" alignItems="center">
                        {isLoading ? (
                            <BaseView flexDirection="row" alignItems="center">
                                <BaseSkeleton
                                    containerStyle={
                                        baseStyles.skeletonBalanceValue
                                    }
                                    animationDirection="horizontalLeft"
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={
                                        theme.colors.skeletonHighlightColor
                                    }
                                    height={18}
                                />
                            </BaseView>
                        ) : priceFeedNotAvailable ? (
                            <BaseText typographyFont="caption">
                                {LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}
                            </BaseText>
                        ) : (
                            <>
                                <BaseText typographyFont="subTitleBold">
                                    {isBalanceVisible ? fiatBalance : "••••"}
                                </BaseText>
                                <BaseText typographyFont="captionRegular">
                                    {exchangeRateCurrency}
                                </BaseText>
                            </>
                        )}
                    </BaseView>

                    <BaseSpacer height={3} />

                    {/* //TODO: add skeleton */}
                    <BaseText
                        typographyFont="captionBold"
                        color={
                            isPositive24hChange
                                ? theme.colors.success
                                : theme.colors.danger
                        }>
                        {change24h}
                    </BaseText>
                </Animated.View>
            </Animated.View>
        )
    },
)

const baseStyles = StyleSheet.create({
    imageContainer: {
        borderRadius: 30,
        padding: 10,
    },
    imageShadow: {
        width: "auto",
    },
    image: { width: 20, height: 20 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        flexGrow: 1,
        paddingHorizontal: 12,
    },
    tokenIcon: {
        width: 40,
        height: 40,
        backgroundColor: "red",
        borderRadius: 20,
        marginRight: 10,
        position: "absolute",
    },
    balancesContainer: {
        alignItems: "flex-end",
    },
    skeletonBalance: { width: 50, paddingVertical: 2 },
    skeletonPercentChange: {
        width: 40,
        paddingVertical: 1,
    },
    skeletonBalanceValue: {
        width: 60,
        paddingVertical: 2,
    },
})
