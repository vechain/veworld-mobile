import React, { memo } from "react"
import { Pressable, View, StyleSheet } from "react-native"
import {
    RenderItemParams,
    ShadowDecorator,
} from "react-native-draggable-flatlist"
import Animated from "react-native-reanimated"
import { BaseIcon } from "~Components"
import { ColorThemeType, useThemedStyles } from "~Common"
import DropShadow from "react-native-drop-shadow"
import { TokenCard } from "./TokenCard"
import { useTokenAnimations } from "./useTokenAnimations"
import { DenormalizedAccountTokenBalance } from "~Storage/Redux/Types"

interface IAnimatedTokenCard
    extends RenderItemParams<DenormalizedAccountTokenBalance> {
    isEdit: boolean
}

export const AnimatedTokenCard = memo(
    ({ item, drag, isActive, isEdit }: IAnimatedTokenCard) => {
        const { styles } = useThemedStyles(baseStyles(isActive))
        const { animatedOpacity } = useTokenAnimations(isEdit)

        return (
            <ShadowDecorator>
                <View style={styles.outerContainer}>
                    <Animated.View>
                        <DropShadow style={styles.cardShadow}>
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
                                    <TokenCard token={item} isEdit={isEdit} />
                                </View>
                            </Pressable>
                        </DropShadow>
                    </Animated.View>
                </View>
            </ShadowDecorator>
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
        cardShadow: theme.shadows.card,
    })
