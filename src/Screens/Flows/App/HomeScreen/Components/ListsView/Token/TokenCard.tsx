import React, { memo, useCallback } from "react"
import { Pressable, View, StyleSheet } from "react-native"
import {
    RenderItemParams,
    ShadowDecorator,
} from "react-native-draggable-flatlist"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseText } from "~Components"
import { ColorThemeType, Token, useThemedStyles } from "~Common"

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

        const animatedWidthRow = useAnimatedStyle(() => {
            return {
                width: withTiming(isEdit ? "88%" : "100%", {
                    duration: 200,
                }),
            }
        }, [isEdit])

        const animatedPositionInnerRow = useAnimatedStyle(() => {
            return {
                transform: [
                    {
                        translateX: withTiming(isEdit ? 40 : 0, {
                            duration: 200,
                        }),
                    },
                ],
            }
        }, [isEdit])

        const animatedOpacity = useAnimatedStyle(() => {
            return {
                opacity: withTiming(isEdit ? 1 : 0, {
                    duration: 200,
                }),
            }
        }, [isEdit])

        const animatedOpacityReverse = useAnimatedStyle(() => {
            return {
                opacity: withTiming(isEdit ? 0 : 1, {
                    duration: 200,
                }),
            }
        }, [isEdit])

        const animatedDeleteIcon = useAnimatedStyle(() => {
            return {
                transform: [
                    {
                        translateX: withTiming(isEdit ? -10 : 0, {
                            duration: 200,
                        }),
                    },
                ],
            }
        }, [isEdit])

        return (
            <ShadowDecorator>
                <View style={styles.outerContainer}>
                    <Animated.View style={animatedWidthRow}>
                        <Pressable
                            onLongPress={() => onDrag(drag)}
                            disabled={isActive}
                            style={styles.pressable}>
                            <Animated.View
                                style={styles.animatedOuterContainer}>
                                <Animated.View
                                    style={[
                                        animatedOpacity,
                                        styles.animatedInnerContainer,
                                    ]}>
                                    <BaseIcon
                                        name={"apps-outline"}
                                        size={28}
                                        action={() => onDeleteItem(item)}
                                    />
                                </Animated.View>

                                <Animated.View
                                    style={[
                                        animatedPositionInnerRow,
                                        styles.aniamtedInnerRow,
                                    ]}>
                                    <View style={styles.innerRow}>
                                        <View style={styles.tokenIcon} />

                                        <View style={styles.textMargin}>
                                            <BaseText typographyFont="subTitle">
                                                {item.name}
                                            </BaseText>
                                            <BaseText>{item.symbol}</BaseText>
                                        </View>

                                        <Animated.View
                                            style={animatedOpacityReverse}>
                                            <BaseText typographyFont="title">
                                                0.2202$
                                            </BaseText>
                                            <BaseText>0.36</BaseText>
                                        </Animated.View>
                                    </View>
                                </Animated.View>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>

                    <Animated.View style={animatedDeleteIcon}>
                        <BaseIcon
                            name={"trash-outline"}
                            size={32}
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

        aniamtedInnerRow: {
            flexDirection: "row",
            justifyContent: "flex-start",
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            height: "100%",
            width: "100%",
        },
        innerRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
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
            marginLeft: 50,
        },
        deleteIconColor: {
            backgroundColor: theme.colors.secondary,
        },
    })
