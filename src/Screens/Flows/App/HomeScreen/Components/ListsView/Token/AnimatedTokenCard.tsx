import React, { useEffect, useMemo } from "react"
import { Pressable, StyleSheet, ViewStyle } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import HapticsService from "~Services/HapticsService"
import { BridgeTokenCard } from "./BridgeTokenCard"
import { TokenCard } from "./TokenCard"
interface IAnimatedTokenCard {
    isEdit: boolean
    isBalanceVisible: boolean
    rootStyle?: ViewStyle
    item: FungibleTokenWithBalance
}

export const AnimatedTokenCard = ({ item, isEdit, isBalanceVisible, rootStyle }: IAnimatedTokenCard) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const isBridgeToken = useMemo(() => {
        return !!item.crossChainProvider
    }, [item.crossChainProvider])

    useEffect(() => {
        isEdit && HapticsService.triggerImpact({ level: "Light" })
    }, [isEdit])

    return (
        <BaseView style={[styles.animatedOuterContainer, rootStyle]}>
            {isEdit && (
                <Pressable style={[styles.animatedInnerContainer]}>
                    <BaseIcon color={theme.colors.text} name={"icon-grip-vertical"} size={30} />
                </Pressable>
            )}
            {isBridgeToken ? (
                <BridgeTokenCard tokenWithBalance={item} isEdit={isEdit} isBalanceVisible={isBalanceVisible} />
            ) : (
                <TokenCard tokenWithBalance={item} isEdit={isEdit} isBalanceVisible={isBalanceVisible} />
            )}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        animatedOuterContainer: {
            backgroundColor: theme.colors.card,
            paddingVertical: 16,
            height: 72,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            opacity: 1,
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
