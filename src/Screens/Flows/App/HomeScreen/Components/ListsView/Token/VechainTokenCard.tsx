import { Image, StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseText, BaseCard, BaseView, BaseSpacer } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { CURRENCY_SYMBOLS, FormattingUtils } from "~Common"
import { DenormalizedAccountTokenBalance } from "~Storage/Redux/Types"
import { useSelector } from "react-redux"
import { getCurrencyExchangeRate } from "~Storage/Redux/Selectors/Currency"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { VeChainToken } from "~Model"

type Props = {
    token: DenormalizedAccountTokenBalance
    isAnimation: boolean
}

export const VechainTokenCard = memo(
    ({ token: tokenBalance, isAnimation }: Props) => {
        const exchangeRate = useSelector(state =>
            getCurrencyExchangeRate(
                state,
                tokenBalance.token.symbol as VeChainToken,
            ),
        )
        const currency = useSelector(selectCurrency)
        const change24h =
            FormattingUtils.humanNumber(exchangeRate?.change || 0) + "%"

        const fiatBalance = FormattingUtils.humanNumber(
            FormattingUtils.convertToFiatBalance(
                tokenBalance.balance,
                exchangeRate?.rate || 0,
                tokenBalance.token.decimals,
            ),
            tokenBalance.balance,
            CURRENCY_SYMBOLS[currency],
        )
        const animatedOpacityReverse = useAnimatedStyle(() => {
            return {
                opacity: withTiming(isAnimation ? 0 : 1, {
                    duration: 200,
                }),
            }
        }, [isAnimation])

        return (
            <Animated.View style={[baseStyles.innerRow]}>
                <BaseView flexDirection="row">
                    <BaseCard style={baseStyles.imageContainer}>
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
                        <BaseText>{tokenBalance.token.symbol}</BaseText>
                    </BaseView>
                </BaseView>
                <Animated.View style={animatedOpacityReverse}>
                    <BaseText typographyFont="title">{fiatBalance}</BaseText>
                    <BaseText>{change24h}</BaseText>
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
    image: { width: 20, height: 20 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        flexGrow: 1,
        paddingLeft: 12,
    },
    tokenIcon: {
        width: 40,
        height: 40,
        backgroundColor: "red",
        borderRadius: 20,
        marginRight: 10,
        position: "absolute",
    },
})
