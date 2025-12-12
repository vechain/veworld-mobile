import { useNavigation } from "@react-navigation/native"
import { default as React, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseSkeleton,
    BaseText,
    BaseView,
    FastActionsBottomSheet,
    showWarningToast,
    useFeatureFlags,
} from "~Components"
import { STARGATE_DAPP_URL, VET } from "~Constants"
import { TokenWithCompleteInfo, useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useTokenCardFiatInfo } from "~Hooks/useTokenCardFiatInfo"
import { useI18nContext } from "~i18n"
import { FastAction, FungibleTokenWithBalance, IconKey } from "~Model"
import { Routes } from "~Navigation"
import { BigNutils, PlatformUtils } from "~Utils"
import { ActionsButtonGroup } from "./ActionsButtonGroup"
import { BalanceView } from "./BalanceView"

type Props = {
    token: TokenWithCompleteInfo
    isBalanceVisible: boolean
    isObserved: boolean
    openQRCodeSheet: () => void
    foundToken?: FungibleTokenWithBalance
}

export const VetBalanceCard = ({ token, isBalanceVisible, foundToken, openQRCodeSheet, isObserved }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { navigateWithTab } = useBrowserTab()

    const { change24h, exchangeRate, isPositive24hChange, isLoading } = useTokenCardFiatInfo(token)

    const featureFlags = useFeatureFlags()

    const {
        ref: FastActionsBottomSheetRef,
        onOpen: openFastActionsSheet,
        onClose: closeFastActionsSheet,
    } = useBottomSheetModal()

    const actionBottomSheetIcon = useCallback(
        (iconName: IconKey, disabled?: boolean) => (
            <BaseIcon
                color={disabled ? theme.colors.actionBottomSheet.disabledIcon : theme.colors.actionBottomSheet.icon}
                name={iconName}
                size={18}
            />
        ),
        [theme.colors.actionBottomSheet.disabledIcon, theme.colors.actionBottomSheet.icon],
    )

    const Actions: Record<string, FastAction> = useMemo(
        () => ({
            send: {
                name: LL.BTN_SEND(),
                disabled: !foundToken || isObserved,
                action: () => {
                    if (foundToken) {
                        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                            token: foundToken,
                        })
                    } else {
                        showWarningToast({
                            text1: LL.ALERT_MSG_NO_FUNDS(),
                        })
                    }
                },
                icon: (
                    <BaseIcon
                        size={16}
                        color={
                            foundToken
                                ? theme.colors.actionBanner.buttonTextSecondary
                                : theme.colors.actionBanner.buttonTextDisabled
                        }
                        name="icon-arrow-up"
                    />
                ),
                testID: "sendButton",
            },
            swap: {
                name: LL.BTN_SWAP(),
                disabled: !foundToken || isObserved,
                action: () => {
                    if (foundToken) {
                        nav.navigate(Routes.SWAP)
                    } else {
                        showWarningToast({
                            text1: LL.ALERT_MSG_NO_FUNDS(),
                        })
                    }
                },
                icon: (
                    <BaseIcon
                        color={
                            foundToken
                                ? theme.colors.actionBanner.buttonTextSecondary
                                : theme.colors.actionBanner.buttonTextDisabled
                        }
                        name="icon-arrow-left-right"
                        size={16}
                    />
                ),
                testID: "swapButton",
            },
            receive: {
                name: LL.COMMON_RECEIVE(),
                action: openQRCodeSheet,
                icon: (
                    <BaseIcon size={16} color={theme.colors.actionBanner.buttonTextSecondary} name="icon-arrow-down" />
                ),
                testID: "reciveButton",
            },
            buy: {
                name: LL.BTN_BUY(),
                action: () => {
                    nav.navigate(Routes.BUY_FLOW)
                },
                icon: (
                    <BaseIcon size={16} color={theme.colors.actionBanner.buttonTextSecondary} name="icon-plus-circle" />
                ),
                testID: "buyButton",
            },
            more: {
                name: LL.COMMON_BTN_MORE(),
                action: openFastActionsSheet,
                icon: (
                    <BaseIcon
                        size={20}
                        color={theme.colors.actionBanner.buttonTextSecondary}
                        name="icon-more-vertical"
                    />
                ),
                iconOnly: true,
                testID: "moreOptionsButton",
            },
        }),
        [
            LL,
            foundToken,
            isObserved,
            nav,
            openFastActionsSheet,
            openQRCodeSheet,
            theme.colors.actionBanner.buttonTextDisabled,
            theme.colors.actionBanner.buttonTextSecondary,
        ],
    )

    const ActionsBottomSheet: Record<string, FastAction> = useMemo(
        () => ({
            buy: {
                name: LL.BTN_BUY(),
                action: () => {
                    nav.navigate(Routes.BUY_FLOW)
                },
                icon: actionBottomSheetIcon("icon-plus-circle"),
                testID: "buyButton",
            },
            send: {
                name: LL.BTN_SEND(),
                disabled: !foundToken || isObserved,
                action: () => {
                    if (foundToken) {
                        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                            token: foundToken,
                        })
                    } else {
                        showWarningToast({
                            text1: LL.ALERT_MSG_NO_FUNDS(),
                        })
                    }
                },
                icon: actionBottomSheetIcon("icon-arrow-up", !foundToken),
                testID: "sendButton",
            },
            swap: {
                name: LL.BTN_SWAP(),
                disabled: !foundToken || isObserved,
                action: () => {
                    if (foundToken) {
                        nav.navigate(Routes.SWAP)
                    } else {
                        showWarningToast({
                            text1: LL.ALERT_MSG_NO_FUNDS(),
                        })
                    }
                },
                icon: actionBottomSheetIcon("icon-arrow-left-right", !foundToken),
                testID: "swapButton",
            },
            receive: {
                name: LL.COMMON_RECEIVE(),
                action: openQRCodeSheet,
                icon: actionBottomSheetIcon("icon-arrow-down"),
                testID: "reciveButton",
            },
            sell: {
                name: LL.BTN_SELL(),
                action: () => {
                    nav.navigate(Routes.SELL_FLOW)
                },
                icon: actionBottomSheetIcon("icon-minus-circle"),
                testID: "sellButton",
                disabled: BigNutils(token.balance?.balance || "0").isZero,
            },
            stakeRewards: {
                name: LL.BTN_STAKE(),
                action: () => {
                    navigateWithTab({
                        title: "Stargate",
                        url: STARGATE_DAPP_URL,
                        navigationFn(u) {
                            nav.navigate(Routes.BROWSER, { url: u, returnScreen: Routes.HOME })
                        },
                    })
                },
                icon: actionBottomSheetIcon("icon-coins"),
                testID: "stakeRewardsButton",
                disabled: !BigNutils(token.balance?.balance || "0").isBiggerThan(10000),
            },
        }),
        [
            LL,
            actionBottomSheetIcon,
            foundToken,
            isObserved,
            nav,
            navigateWithTab,
            openQRCodeSheet,
            token.balance?.balance,
        ],
    )

    const vetActions = useMemo(() => [Actions.send, Actions.receive, Actions.buy, Actions.more], [Actions])
    const vthoActions = useMemo(() => [Actions.send, Actions.swap, Actions.buy], [Actions])
    const vetBottomSheet = useMemo(() => {
        const commonActions = [
            ActionsBottomSheet.buy,
            ActionsBottomSheet.send,
            ActionsBottomSheet.swap,
            ActionsBottomSheet.receive,
        ]

        if (PlatformUtils.isAndroid() && featureFlags.paymentProvidersFeature.coinify.android)
            commonActions.push(ActionsBottomSheet.sell)
        // Uncomment this when we have a way to show the sell button on iOS
        // if (PlatformUtils.isIOS() && featureFlags.paymentProvidersFeature.coinify.iOS)
        // commonActions.push(ActionsBottomSheet.sell)

        if (featureFlags.discoveryFeature.showStargateBanner) {
            commonActions.push(ActionsBottomSheet.stakeRewards)
        }

        return commonActions
    }, [
        ActionsBottomSheet,
        featureFlags.paymentProvidersFeature.coinify.android,
        // featureFlags.paymentProvidersFeature.coinify.iOS,
        featureFlags.discoveryFeature.showStargateBanner,
    ])

    const renderFiatBalance = useMemo(() => {
        if (isLoading)
            return (
                <BaseView flexDirection="row">
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={14}
                        width={60}
                    />
                </BaseView>
            )
        if (!exchangeRate) return <BaseText typographyFont="bodyMedium">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>

        return (
            <BalanceView
                isBalanceVisible={isBalanceVisible}
                tokenWithInfo={token}
                change24h={change24h}
                isPositiveChange={isPositive24hChange}
            />
        )
    }, [
        isLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        exchangeRate,
        LL,
        isBalanceVisible,
        token,
        change24h,
        isPositive24hChange,
    ])

    return (
        <BaseView style={styles.container}>
            {renderFiatBalance}
            <ActionsButtonGroup actions={token.symbol === VET.symbol ? vetActions : vthoActions} isVet />
            <FastActionsBottomSheet
                ref={FastActionsBottomSheetRef}
                actions={vetBottomSheet}
                closeBottomSheet={closeFastActionsSheet}
            />
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 16,
            gap: 16,
        },
    })
