import React, { useCallback, useMemo } from "react"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "~i18n"
import { BaseIcon, showWarningToast } from "~Components"
import { FungibleTokenWithBalance, IconKey } from "~Model"
import { Routes } from "~Navigation"
import { useTheme } from "~Hooks"

type Props = {
    foundToken?: FungibleTokenWithBalance
    isActionDisabled: boolean
    openQRCodeSheet: () => void
    openFastActionsSheet: () => void
}

export const useVetActions = ({ foundToken, isActionDisabled, openQRCodeSheet, openFastActionsSheet }: Props) => {
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

    const showNoFundsError = useCallback(() => {
        showWarningToast({
            text1: LL.HEADS_UP(),
            text2: LL.ALERT_MSG_NO_FUNDS_FOR_ACTION(),
        })
    }, [LL])

    const navigateToSend = useCallback(() => {
        if (foundToken) {
            nav.navigate(Routes.INSERT_ADDRESS_SEND, { token: foundToken })
        } else {
            showNoFundsError()
        }
    }, [foundToken, nav, showNoFundsError])

    const navigateToSwap = useCallback(() => {
        if (!isActionDisabled) {
            nav.navigate(Routes.SWAP)
        } else {
            showNoFundsError()
        }
    }, [isActionDisabled, nav, showNoFundsError])

    const navigateToBuy = useCallback(() => nav.navigate(Routes.BUY_FLOW), [nav])

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

    const barActions = useMemo(
        () => ({
            send: {
                name: LL.BTN_SEND(),
                action: navigateToSend,
                icon: actionBarIcon("icon-arrow-up", isActionDisabled),
                testID: "sendButton",
                disabled: isActionDisabled,
            },
            receive: {
                name: LL.COMMON_RECEIVE(),
                action: openQRCodeSheet,
                icon: actionBarIcon("icon-arrow-down", false),
                testID: "receiveButton",
                disabled: false,
            },
            buy: {
                name: LL.BTN_BUY(),
                action: navigateToBuy,
                icon: actionBarIcon("icon-plus-circle", false),
                testID: "buyButton",
                disabled: false,
            },
            swap: {
                name: LL.BTN_SWAP(),
                action: navigateToSwap,
                icon: actionBarIcon("icon-arrow-left-right", isActionDisabled),
                testID: "swapButton",
                disabled: isActionDisabled,
            },
            more: moreAction,
        }),
        [
            LL,
            navigateToSend,
            navigateToBuy,
            navigateToSwap,
            isActionDisabled,
            openQRCodeSheet,
            actionBarIcon,
            moreAction,
        ],
    )

    const bottomSheetActions = useMemo(
        () => ({
            send: {
                name: LL.BTN_SEND(),
                action: navigateToSend,
                icon: actionBottomSheetIcon("icon-arrow-up", isActionDisabled),
                testID: "sendButton",
                disabled: isActionDisabled,
            },
            receive: {
                name: LL.COMMON_RECEIVE(),
                action: openQRCodeSheet,
                icon: actionBottomSheetIcon("icon-arrow-down", false),
                testID: "receiveButton",
                disabled: false,
            },
            buy: {
                name: LL.BTN_BUY(),
                action: navigateToBuy,
                icon: actionBottomSheetIcon("icon-plus-circle", false),
                testID: "buyButton",
                disabled: false,
            },
            swap: {
                name: LL.BTN_SWAP(),
                action: navigateToSwap,
                icon: actionBottomSheetIcon("icon-arrow-left-right", isActionDisabled),
                testID: "swapButton",
                disabled: isActionDisabled,
            },
        }),
        [LL, navigateToSend, navigateToSwap, navigateToBuy, isActionDisabled, openQRCodeSheet, actionBottomSheetIcon],
    )

    return { bottomSheetActions, barActions }
}
