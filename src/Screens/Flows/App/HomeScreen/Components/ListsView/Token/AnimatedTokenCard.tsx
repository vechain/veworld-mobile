import React, { useEffect, useMemo } from "react"
import { Pressable, StyleSheet } from "react-native"
import { RenderItemParams } from "react-native-draggable-flatlist"
import { BaseIcon, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import HapticsService from "~Services/HapticsService"
import { BridgeTokenCard } from "./BridgeTokenCard"
import { TokenCard } from "./TokenCard"
interface IAnimatedTokenCard extends Omit<RenderItemParams<FungibleTokenWithBalance>, "getIndex"> {
    isEdit: boolean
    isBalanceVisible: boolean
}

export const AnimatedTokenCard = ({ item, drag, isActive, isEdit, isBalanceVisible }: IAnimatedTokenCard) => {
    const { styles, theme } = useThemedStyles(baseStyles(isActive))

    const isBridgeToken = useMemo(() => {
        return !!item.crossChainProvider
    }, [item.crossChainProvider])

    useEffect(() => {
        isEdit && HapticsService.triggerImpact({ level: "Light" })
    }, [isActive, isEdit])

    return (
        <BaseView style={styles.animatedOuterContainer}>
            {isEdit && (
                <Pressable
                    disabled={isActive}
                    style={[styles.animatedInnerContainer]}
                    onPressIn={isEdit ? drag : undefined}>
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

const baseStyles = (isActive: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        animatedOuterContainer: {
            backgroundColor: theme.colors.card,
            paddingVertical: 16,
            height: 72,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            opacity: isActive ? 0.6 : 1,
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
