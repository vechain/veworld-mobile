import React, { useEffect } from "react"
import { StyleSheet, Pressable } from "react-native"
import { RenderItemParams } from "react-native-draggable-flatlist"
import { BaseIcon, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { TokenCard } from "./TokenCard"
import { FungibleTokenWithBalance } from "~Model"
import HapticsService from "~Services/HapticsService"

interface IAnimatedTokenCard
    extends RenderItemParams<FungibleTokenWithBalance> {
    isEdit: boolean
    isBalanceVisible: boolean
}

export const AnimatedTokenCard = ({
    item,
    drag,
    isActive,
    isEdit,
    isBalanceVisible,
}: IAnimatedTokenCard) => {
    const { styles, theme } = useThemedStyles(baseStyles(isActive))

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
                    <BaseIcon
                        color={theme.colors.text}
                        name={"drag"}
                        size={30}
                    />
                </Pressable>
            )}
            <TokenCard
                tokenWithBalance={item}
                isEdit={isEdit}
                isBalanceVisible={isBalanceVisible}
            />
        </BaseView>
    )
}

const baseStyles = (isActive: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        animatedOuterContainer: {
            backgroundColor: theme.colors.card,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 16,
            opacity: isActive ? 0.6 : 1,
            height: 62,
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
