import { Image, StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText, BaseCard, BaseView, BaseSpacer } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { CURRENCY } from "~Common"
import CurrencyConfig from "~Common/Constant/CurrencyConfig/CurrencyConfig"
import { DenormalizedAccountTokenBalance } from "~Storage/Redux/Slices"

type Props = {
    token: DenormalizedAccountTokenBalance
    isAnimation: boolean
    selectedCurrency: CURRENCY
}

export const TokenCard = memo(
    ({ token: tokenBalance, isAnimation, selectedCurrency }: Props) => {
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
                <BaseView flexDirection="row">
                    <BaseCard
                        style={{
                            borderRadius: 30,
                            padding: 10,
                        }}>
                        <Image
                            source={{ uri: tokenBalance.token.icon }}
                            style={{ width: 20, height: 20 }}
                        />
                    </BaseCard>
                    <BaseSpacer width={16} />
                    <BaseView>
                        <BaseText typographyFont="subTitle">
                            {tokenBalance.token.name}
                        </BaseText>
                        <BaseText>{tokenBalance.token.symbol}</BaseText>
                    </BaseView>
                </BaseView>
                <Animated.View style={animatedOpacityReverse}>
                    {/* TODO: add correct currency conversion */}
                    <BaseText typographyFont="title">
                        0.2202{selectedCurrencyConfig?.symbol}
                    </BaseText>
                    <BaseText>{tokenBalance.balance}</BaseText>
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
})
