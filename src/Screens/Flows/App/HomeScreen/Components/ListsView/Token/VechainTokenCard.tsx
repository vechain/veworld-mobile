import { Image, StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseText, BaseCard, BaseView, BaseSpacer } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useBalances, useTheme } from "~Common"
import { FormattingUtils } from "~Utils"
import { selectCurrencyExchangeRate } from "~Storage/Redux/Selectors/Currency"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { TokenWithCompleteInfo } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { COLORS } from "~Common/Theme"

type Props = {
    tokenWithInfo: TokenWithCompleteInfo
    isAnimation: boolean
}

export const VechainTokenCard = memo(
    ({ tokenWithInfo, isAnimation }: Props) => {
        const theme = useTheme()
        const exchangeRate = useAppSelector(state =>
            selectCurrencyExchangeRate(state, tokenWithInfo.symbol as string),
        )
        const currency = useAppSelector(selectCurrency)
        const isPositive24hChange = (exchangeRate?.change || 0) > 0
        const change24h =
            (isPositive24hChange ? "+" : "") +
            FormattingUtils.humanNumber(
                exchangeRate?.change || 0,
                exchangeRate?.change || 0,
            ) +
            "%"

        const { fiatBalance, tokenUnitBalance } = useBalances({
            token: tokenWithInfo,
        })

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
                            source={{ uri: tokenWithInfo.icon }}
                            style={baseStyles.image}
                        />
                    </BaseCard>
                    <BaseSpacer width={16} />
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">
                            {tokenWithInfo.name}
                        </BaseText>
                        <BaseView flexDirection="row" alignItems="baseline">
                            <BaseText
                                typographyFont="bodyMedium"
                                color={tokenValueLabelColor}>
                                {tokenUnitBalance}{" "}
                            </BaseText>
                            <BaseText
                                typographyFont="captionRegular"
                                color={tokenValueLabelColor}>
                                {tokenWithInfo.symbol}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                </BaseView>
                <Animated.View
                    style={[
                        animatedOpacityReverse,
                        baseStyles.balancesContainer,
                    ]}>
                    <BaseView flexDirection="row" alignItems="baseline">
                        <BaseText typographyFont="subTitleBold">
                            {fiatBalance}{" "}
                        </BaseText>
                        <BaseText typographyFont="captionRegular">
                            {currency}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={3} />
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
})
