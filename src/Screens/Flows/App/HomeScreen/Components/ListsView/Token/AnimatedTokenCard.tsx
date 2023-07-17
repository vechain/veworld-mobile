import React, { memo, useEffect } from "react"
import { Pressable, View, StyleSheet } from "react-native"
import { RenderItemParams } from "react-native-draggable-flatlist"
import Animated from "react-native-reanimated"
import { BaseIcon } from "~Components"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { TokenCard } from "./TokenCard"
import { useTokenAnimations } from "./useTokenAnimations"
import { FungibleTokenWithBalance } from "~Model"
import HapticsService from "~Services/HapticsService"

interface IAnimatedTokenCard
    extends RenderItemParams<FungibleTokenWithBalance> {
    isEdit: boolean
}

export const AnimatedTokenCard = memo(
    ({ item, drag, isActive, isEdit }: IAnimatedTokenCard) => {
        const { styles } = useThemedStyles(baseStyles(isActive))
        const { animatedOpacity } = useTokenAnimations(isEdit)

        useEffect(() => {
            isEdit && HapticsService.triggerImpact({ level: "Light" })
        }, [isActive, isEdit])

        return (
            <View style={styles.outerContainer}>
                <Animated.View>
                    <Pressable
                        onPressIn={isEdit ? drag : undefined}
                        disabled={isActive}
                        style={styles.pressable}>
                        <View style={styles.animatedOuterContainer}>
                            <Animated.View
                                style={[
                                    animatedOpacity,
                                    styles.animatedInnerContainer,
                                ]}>
                                <BaseIcon name={"drag"} size={28} />
                            </Animated.View>
                            <TokenCard
                                tokenWithBalance={item}
                                isEdit={isEdit}
                            />
                        </View>
                    </Pressable>
                </Animated.View>
            </View>
        )
    },
)

const baseStyles = (isActive: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        outerContainer: {
            flexDirection: "row",
            alignItems: "center",
            height: 62,
        },
        pressable: {
            borderRadius: 10,
            marginHorizontal: 20,
        },
        animatedOuterContainer: {
            backgroundColor: theme.colors.card,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 16,
            opacity: isActive ? 0.6 : 1,
            height: 62,
        },
        animatedInnerContainer: {
            position: "absolute",
            left: 10,
        },

        deleteIconColor: {
            backgroundColor: theme.colors.secondary,
        },
    })
