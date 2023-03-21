import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

type Action = {
    name: string
    icon: React.ReactNode
    action: () => void
}

export const HomeScreenActions = memo(() => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)

    const navigateToBuy = useCallback(() => {
        nav.navigate(Routes.BUY)
    }, [nav])
    const navigateToSend = useCallback(() => {
        nav.navigate(Routes.SEND)
    }, [nav])
    const navigateToSwap = useCallback(() => {
        nav.navigate(Routes.SWAP)
    }, [nav])
    const navigateToHistory = useCallback(() => {
        nav.navigate(Routes.HISTORY)
    }, [nav])

    const Actions: Action[] = [
        {
            name: LL.BTN_BUY(),
            action: navigateToBuy,
            icon: <BaseIcon color={theme.colors.text} name="cart-outline" />,
        },
        {
            name: LL.BTN_SEND(),
            action: navigateToSend,
            icon: <BaseIcon color={theme.colors.text} name="send-outline" />,
        },
        {
            name: LL.BTN_SWAP(),
            action: navigateToSwap,
            icon: <BaseIcon color={theme.colors.text} name="swap-horizontal" />,
        },
        {
            name: LL.BTN_HISTORY(),
            action: navigateToHistory,
            icon: <BaseIcon color={theme.colors.text} name="history" />,
        },
    ]

    const renderAction = useCallback((action: Action) => {
        return (
            <BaseTouchable action={action.action}>
                <BaseView flexDirection="column" alignItems="center">
                    {action.icon}
                    <BaseSpacer height={6} />
                    <BaseText typographyFont="smallButtonPrimary">
                        {action.name}
                    </BaseText>
                </BaseView>
            </BaseTouchable>
        )
    }, [])

    return (
        <DropShadow style={themedStyles.shadowContainer}>
            <BaseView
                flexDirection="row"
                justifyContent="space-around"
                alignItems="center"
                bg={theme.colors.card}
                borderRadius={34}
                px={24}
                py={12}>
                {Actions.map(action => renderAction(action))}
            </BaseView>
        </DropShadow>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        shadowContainer: {
            ...theme.shadows.card,
            paddingHorizontal: 20,
            justifyContent: "center",
        },
    })
