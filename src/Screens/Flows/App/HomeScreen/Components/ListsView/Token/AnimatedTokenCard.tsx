import React, { MutableRefObject, useCallback, useEffect } from "react"
import { StyleSheet, Pressable } from "react-native"
import { RenderItemParams } from "react-native-draggable-flatlist"
import { BaseIcon, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { TokenCard } from "./TokenCard"
import { FungibleTokenWithBalance } from "~Model"
import HapticsService from "~Services/HapticsService"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { BalanceUtils } from "~Utils"
import { TouchableOpacity } from "react-native-gesture-handler"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"

interface IAnimatedTokenCard
    extends RenderItemParams<FungibleTokenWithBalance> {
    isEdit: boolean
    isBalanceVisible: boolean
    swipeableItemRefs?: MutableRefObject<
        Map<string, SwipeableItemImperativeRef>
    >
}

export const AnimatedTokenCard = ({
    item,
    drag,
    isActive,
    isEdit,
    isBalanceVisible,
    swipeableItemRefs,
}: IAnimatedTokenCard) => {
    const { styles, theme } = useThemedStyles(baseStyles(isActive))

    const nav = useNavigation()

    useEffect(() => {
        isEdit && HapticsService.triggerImpact({ level: "Light" })
    }, [isActive, isEdit])

    const closeOtherSwipeableItems = useCallback(() => {
        swipeableItemRefs?.current.forEach(ref => {
            ref?.close()
        })
    }, [swipeableItemRefs])

    const onTokenPress = useCallback(
        (_isEdit: boolean, token: FungibleTokenWithBalance) => {
            const isTokenBalance = BalanceUtils.getIsTokenWithBalance(token)

            if (!_isEdit && isTokenBalance) {
                closeOtherSwipeableItems()
                nav.navigate(Routes.SELECT_AMOUNT_SEND, {
                    token,
                    initialRoute: Routes.HOME,
                })
            }
        },
        [nav, closeOtherSwipeableItems],
    )

    const PressableComponent = isEdit ? Pressable : TouchableOpacity

    return (
        <BaseView style={styles.touchableContainer}>
            <PressableComponent
                disabled={isActive}
                onPress={() => onTokenPress(isEdit, item)}
                style={styles.pressable}>
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
            </PressableComponent>
        </BaseView>
    )
}

const baseStyles = (isActive: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        touchableContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
        pressable: {
            borderRadius: 10,
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
            position: "relative",
            height: "100%",
            paddingLeft: 12,
            justifyContent: "center",
            color: "red",
        },
        deleteIconColor: {
            backgroundColor: theme.colors.secondary,
        },
    })
