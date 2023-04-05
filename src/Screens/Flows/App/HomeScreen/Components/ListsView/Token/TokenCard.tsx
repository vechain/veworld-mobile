import { Image, StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseText, BaseCard, BaseView, BaseSpacer } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { DenormalizedAccountTokenBalance } from "~Storage/Redux/Types"

type Props = {
    token: DenormalizedAccountTokenBalance
    isEdit: boolean
}

export const TokenCard = memo(({ token: tokenBalance, isEdit }: Props) => {
    const animatedOpacityReverse = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isEdit ? 0 : 1, {
                duration: 200,
            }),
        }
    }, [isEdit])

    const styles = baseStyles(isEdit)

    return (
        <BaseView style={styles.innerRow}>
            <BaseView flexDirection="row">
                <BaseCard style={styles.imageContainer}>
                    <Image
                        source={{ uri: tokenBalance.token.icon }}
                        style={styles.image}
                    />
                </BaseCard>
                <BaseSpacer width={16} />
                <BaseView>
                    <BaseText typographyFont="subTitleBold">
                        {tokenBalance.token.name}
                    </BaseText>
                </BaseView>
            </BaseView>
            <Animated.View
                style={[
                    animatedOpacityReverse,
                    { flexDirection: "row", alignItems: "flex-end" },
                ]}>
                <BaseText typographyFont="subTitleBold">
                    {tokenBalance.balance}
                </BaseText>
                <BaseText> {tokenBalance.token.symbol}</BaseText>
            </Animated.View>
        </BaseView>
    )
})

const baseStyles = (isEdit: boolean) =>
    StyleSheet.create({
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
            paddingHorizontal: 12,
            paddingLeft: isEdit ? 44 : 12,
        },
    })
