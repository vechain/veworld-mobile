import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useMemo } from "react"
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
    action: () => void
    icon: React.ReactNode
    testID: string
}

export const HomeScreenActions = memo(() => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)

    const Actions: Action[] = useMemo(
        () => [
            {
                name: LL.BTN_BUY(),
                action: () => nav.navigate(Routes.BUY),
                icon: (
                    <BaseIcon color={theme.colors.text} name="cart-outline" />
                ),
                testID: "buyButton",
            },
            {
                name: LL.BTN_SEND(),
                action: () => nav.navigate(Routes.SELECT_TOKEN_SEND),
                icon: (
                    <BaseIcon color={theme.colors.text} name="send-outline" />
                ),
                testID: "sendButton",
            },
            {
                name: LL.BTN_SWAP(),
                action: () => nav.navigate(Routes.SWAP),
                icon: (
                    <BaseIcon
                        color={theme.colors.text}
                        name="swap-horizontal"
                    />
                ),
                testID: "swapButton",
            },
            {
                name: LL.BTN_HISTORY(),
                action: () => nav.navigate(Routes.HISTORY),
                icon: <BaseIcon color={theme.colors.text} name="history" />,
                testID: "historyButton",
            },
        ],
        [LL, nav, theme.colors.text],
    )

    const renderAction = useCallback((action: Action) => {
        return (
            <BaseTouchable
                key={action.name}
                action={action.action}
                testID={action.testID}>
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
                justifyContent="space-between"
                alignItems="center"
                bg={theme.colors.card}
                borderRadius={34}
                px={38}
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
