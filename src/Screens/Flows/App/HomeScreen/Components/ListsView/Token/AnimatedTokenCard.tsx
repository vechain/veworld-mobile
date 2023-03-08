import React, { memo, useCallback } from "react"
import { Pressable, View, StyleSheet } from "react-native"
import {
    RenderItemParams,
    ShadowDecorator,
} from "react-native-draggable-flatlist"
import Animated from "react-native-reanimated"
import { BaseIcon } from "~Components"
import { ColorThemeType, Token, useThemedStyles } from "~Common"
import DropShadow from "react-native-drop-shadow"
import { TokenCard } from "./TokenCard"
import { useTokenAnimations } from "./useTokenAnimations"

interface IAnimatedTokenCard extends RenderItemParams<Token> {
    isEdit: boolean
    onDeleteItem: (item: Token) => void
}

export const AnimatedTokenCard = memo(
    ({ item, drag, isActive, isEdit, onDeleteItem }: IAnimatedTokenCard) => {
        const { styles } = useThemedStyles(baseStyles(isActive))

        const onDrag = useCallback(
            (_drag: any) => {
                return isEdit ? _drag() : undefined
            },
            [isEdit],
        )

        const {
            animatedWidthRow,
            animatedPositionInnerRow,
            animatedOpacity,
            animatedDeleteIcon,
        } = useTokenAnimations(isEdit)

        return (
            <ShadowDecorator>
                <View style={styles.outerContainer}>
                    <Animated.View style={animatedWidthRow}>
                        <DropShadow style={styles.cardShadow}>
                            <Pressable
                                onLongPress={() => onDrag(drag)}
                                disabled={isActive}
                                style={styles.pressable}>
                                <View style={styles.animatedOuterContainer}>
                                    <Animated.View
                                        style={[
                                            animatedOpacity,
                                            styles.animatedInnerContainer,
                                        ]}>
                                        <BaseIcon
                                            name={"drag"}
                                            size={28}
                                            action={() => onDeleteItem(item)}
                                        />
                                    </Animated.View>

                                    <Animated.View
                                        style={[
                                            animatedPositionInnerRow,
                                            styles.animatedInnerRow,
                                        ]}>
                                        <TokenCard
                                            token={item}
                                            isAnimation={isEdit}
                                        />
                                    </Animated.View>
                                </View>
                            </Pressable>
                        </DropShadow>
                    </Animated.View>

                    <Animated.View style={animatedDeleteIcon}>
                        <BaseIcon
                            name={"trash-can-outline"}
                            size={28}
                            action={() => onDeleteItem(item)}
                            style={styles.deleteIconColor}
                        />
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
        },
        pressable: {
            borderRadius: 10,
            height: 62,
            marginHorizontal: 20,
        },
        animatedOuterContainer: {
            backgroundColor: theme.colors.card,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 10,
            opacity: isActive ? 0.6 : 1,
        },
        animatedInnerContainer: {
            position: "absolute",
            marginLeft: 12,
        },
        animatedInnerRow: {
            flexDirection: "row",
            justifyContent: "flex-start",
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            height: "100%",
            width: "100%",
        },

        deleteIconColor: {
            backgroundColor: theme.colors.secondary,
        },
        cardShadow: theme.shadows.card,
    })
