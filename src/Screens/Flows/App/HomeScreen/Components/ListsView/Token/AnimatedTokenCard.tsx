import React, { useEffect } from "react"
import { Pressable, StyleSheet } from "react-native"
import { RenderItemParams } from "react-native-draggable-flatlist"
import { BaseIcon, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { TokenCard } from "./TokenCard"
import { FungibleTokenWithBalance } from "~Model"
import HapticsService from "~Services/HapticsService"
import Animated from "react-native-reanimated"

interface IAnimatedTokenCard extends RenderItemParams<FungibleTokenWithBalance> {
    isEdit: boolean
    isBalanceVisible: boolean
}

export const AnimatedTokenCard = ({ item, drag, isActive, isEdit, isBalanceVisible }: IAnimatedTokenCard) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    useEffect(() => {
        isEdit && HapticsService.triggerImpact({ level: "Light" })
    }, [isActive, isEdit])

    return (
        <BaseView px={20} mb={4}>
            <Animated.View style={[styles.animatedOuterContainer]}>
                {isEdit && (
                    <Pressable style={[styles.animatedInnerContainer]} onPressIn={isEdit ? drag : undefined}>
                        <BaseIcon color={theme.colors.text} name={"icon-grip-vertical"} size={30} />
                    </Pressable>
                )}
                <TokenCard tokenWithBalance={item} isEdit={isEdit} isBalanceVisible={isBalanceVisible} />
            </Animated.View>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        animatedOuterContainer: {
            alignItems: "center",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 14,
            backgroundColor: theme.colors.tokenCardBackground,
            borderColor: theme.colors.tokenCardBorder,
            borderWidth: 1,
        },
        animatedInnerContainer: {
            position: "relative",
            height: "100%",
            paddingLeft: 12,
            paddingRight: 3,
            justifyContent: "center",
            color: "red",
        },
    })
