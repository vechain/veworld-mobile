import { Image, StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseText, BaseCard, BaseView, BaseSpacer } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { FormattingUtils, useTheme } from "~Common"
import { DenormalizedAccountTokenBalance } from "~Storage/Redux/Types"
import { getCurrencyExchangeRate } from "~Storage/Redux/Selectors/Currency"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { VeChainToken } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { COLORS } from "~Common/Theme"

type Props = {
    token: DenormalizedAccountTokenBalance
    isAnimation: boolean
}

export const VechainTokenCard = memo(
    ({ token: tokenBalance, isAnimation }: Props) => {
        const theme = useTheme()
        const exchangeRate = useAppSelector(state =>
            getCurrencyExchangeRate(
                state,
                tokenBalance.token.symbol as VeChainToken,
            ),
        )
        const currency = useAppSelector(selectCurrency)
        const isPositive24hChange = (exchangeRate?.change || 0) > 0
        const change24h =
            (isPositive24hChange ? "+" : "") +
            FormattingUtils.humanNumber(exchangeRate?.change || 0) +
            "%"

        const fiatBalance = FormattingUtils.humanNumber(
            FormattingUtils.convertToFiatBalance(
                tokenBalance.balance,
                exchangeRate?.rate || 0,
                tokenBalance.token.decimals,
            ),
            tokenBalance.balance,
        )
        const tokenUnitBalance = FormattingUtils.humanNumber(
            FormattingUtils.convertToFiatBalance(
                tokenBalance.balance,
                1,
                tokenBalance.token.decimals,
            ),
            tokenBalance.balance,
        )

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
                            source={{ uri: tokenBalance.token.icon }}
                            style={baseStyles.image}
                        />
                    </BaseCard>
                    <BaseSpacer width={16} />
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">
                            {tokenBalance.token.name}
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
                                {tokenBalance.token.symbol}
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
