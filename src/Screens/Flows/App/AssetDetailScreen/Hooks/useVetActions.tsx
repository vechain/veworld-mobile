import React, { useCallback, useMemo } from "react"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "~i18n"
import { BaseIcon, showWarningToast } from "~Components"
import { FastAction, FungibleTokenWithBalance, IconKey } from "~Model"
import { Routes } from "~Navigation"
import { useTheme } from "~Hooks"

type UseVetActionsProps = {
    foundToken?: FungibleTokenWithBalance
    isObserved: boolean
    openQRCodeSheet: () => void
    openFastActionsSheet: () => void
}

export const useVetActions = ({
    foundToken,
    isObserved,
    openQRCodeSheet,
    openFastActionsSheet,
}: UseVetActionsProps) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const actionBarIcon = useCallback(
        (iconName: IconKey, disabled?: boolean) => (
            <BaseIcon
                size={16}
                color={
                    !disabled
                        ? theme.colors.actionBanner.buttonTextSecondary
                        : theme.colors.actionBanner.buttonTextDisabled
                }
                name={iconName}
            />
        ),
        [theme.colors.actionBanner],
    )

    const actionBottomSheetIcon = useCallback(
        (iconName: IconKey, disabled?: boolean) => (
            <BaseIcon
                color={disabled ? theme.colors.actionBottomSheet.disabledIcon : theme.colors.actionBottomSheet.icon}
                name={iconName}
                size={18}
            />
        ),
        [theme.colors.actionBottomSheet],
    )

    const createBarAction = useCallback(
        (name: string, action: () => void, iconName: IconKey, testID: string, disabled?: boolean): FastAction => ({
            name,
            disabled,
            action,
            icon: actionBarIcon(iconName, disabled),
            testID,
        }),
        [actionBarIcon],
    )

    const createBottomSheetAction = useCallback(
        (name: string, action: () => void, iconName: IconKey, testID: string, disabled?: boolean): FastAction => ({
            name,
            disabled,
            action,
            icon: actionBottomSheetIcon(iconName, disabled),
            testID,
        }),
        [actionBottomSheetIcon],
    )

    const sendAction = useCallback(() => {
        if (foundToken) {
            nav.navigate(Routes.INSERT_ADDRESS_SEND, { token: foundToken })
        } else {
            showWarningToast({
                text1: LL.HEADS_UP(),
                text2: LL.ALERT_MSG_NO_FUNDS_FOR_ACTION(),
            })
        }
    }, [foundToken, LL, nav])

    const barActions = useMemo(
        () => ({
            send: createBarAction(LL.BTN_SEND(), sendAction, "icon-arrow-up", "sendButton", !foundToken || isObserved),
            receive: createBarAction(LL.COMMON_RECEIVE(), openQRCodeSheet, "icon-arrow-down", "receiveButton", false),
            buy: createBarAction(
                LL.BTN_BUY(),
                () => nav.navigate(Routes.BUY_FLOW),
                "icon-plus-circle",
                "buyButton",
                false,
            ),
            swap: createBarAction(
                LL.BTN_SWAP(),
                () => {
                    if (foundToken && !isObserved) {
                        nav.navigate(Routes.SWAP)
                    } else {
                        showWarningToast({
                            text1: LL.HEADS_UP(),
                            text2: LL.ALERT_MSG_NO_FUNDS_FOR_ACTION(),
                        })
                    }
                },
                "icon-arrow-left-right",
                "swapButton",
                !foundToken || isObserved,
            ),
        }),
        [LL, createBarAction, foundToken, isObserved, nav, openQRCodeSheet, sendAction],
    )

    const bottomSheetActions = useMemo(
        () => ({
            send: createBottomSheetAction(
                LL.BTN_SEND(),
                sendAction,
                "icon-arrow-up",
                "sendButton",
                !foundToken || isObserved,
            ),
            receive: createBottomSheetAction(
                LL.COMMON_RECEIVE(),
                openQRCodeSheet,
                "icon-arrow-down",
                "receiveButton",
                false,
            ),
            buy: createBottomSheetAction(
                LL.BTN_BUY(),
                () => nav.navigate(Routes.BUY_FLOW),
                "icon-plus-circle",
                "buyButton",
                false,
            ),
            swap: createBottomSheetAction(
                LL.BTN_SWAP(),
                () => {
                    if (foundToken && !isObserved) {
                        nav.navigate(Routes.SWAP)
                    } else {
                        showWarningToast({
                            text1: LL.HEADS_UP(),
                            text2: LL.ALERT_MSG_NO_FUNDS_FOR_ACTION(),
                        })
                    }
                },
                "icon-arrow-left-right",
                "swapButton",
                !foundToken || isObserved,
            ),
        }),
        [LL, createBottomSheetAction, foundToken, isObserved, nav, openQRCodeSheet, sendAction],
    )

    const moreAction = useMemo(
        () => ({
            name: LL.COMMON_BTN_MORE(),
            action: openFastActionsSheet,
            icon: (
                <BaseIcon size={20} color={theme.colors.actionBanner.buttonTextSecondary} name="icon-more-vertical" />
            ),
            iconOnly: true,
            testID: "moreOptionsButton",
        }),
        [LL, openFastActionsSheet, theme.colors.actionBanner.buttonTextSecondary],
    )

    const VetActions = useMemo(
        () => [barActions.send, barActions.receive, barActions.buy, moreAction],
        [barActions, moreAction],
    )

    const VthoActions = useMemo(() => [barActions.send, barActions.swap, barActions.receive], [barActions])

    const ActionsBottomSheet = useMemo(
        () => [bottomSheetActions.buy, bottomSheetActions.send, bottomSheetActions.swap, bottomSheetActions.receive],
        [bottomSheetActions],
    )

    return {
        VetActions,
        VthoActions,
        ActionsBottomSheet,
    }
}
