import { StyleSheet, View } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { FungibleToken } from "~Common/Constant/Token/TokenConstants"
import { CURRENCY, Token } from "~Common"
import CurrencyConfig from "~Common/Constant/CurrencyConfig/CurrencyConfig"

type Props = {
    token: FungibleToken | Token
    isAnimation: boolean
    selectedCurrency: CURRENCY
}

export const TokenCard = memo(
    ({ token, isAnimation, selectedCurrency }: Props) => {
        const selectedCurrencyConfig = useMemo(
            () =>
                CurrencyConfig.find(curr => curr.currency === selectedCurrency),
            [selectedCurrency],
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
                <View style={baseStyles.tokenIcon} />

                <View style={baseStyles.textMargin}>
                    <BaseText typographyFont="subTitle">{token.name}</BaseText>
                    <BaseText>{token.symbol}</BaseText>
                </View>

                <Animated.View style={animatedOpacityReverse}>
                    <BaseText typographyFont="title">
                        0.2202{selectedCurrencyConfig?.symbol}
                    </BaseText>
                    <BaseText>0.36</BaseText>
                </Animated.View>
            </Animated.View>
        )
    },
)

const baseStyles = StyleSheet.create({
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
    textMargin: {
        marginLeft: 38,
    },
})
