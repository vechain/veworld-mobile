import { TokenWithCompleteInfo, useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useTokenCardFiatInfo } from "~Screens/Flows/App/HomeScreen/Components/ListsView/Token/useTokenCardFiatInfo"
import React, { useCallback, useMemo } from "react"
import { BaseIcon, BaseSkeleton, BaseText, BaseView, FastActionsBottomSheet, showWarningToast } from "~Components"
import { StyleSheet } from "react-native"
import { BalanceView } from "./BalanceView"
import { FastAction, FungibleTokenWithBalance, IconKey } from "~Model"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { AssetActionsBar } from "./AssetActionsBar"

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

    const { change24h, exchangeRate, isPositive24hChange, isLoading } = useTokenCardFiatInfo(token)

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

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
                disabled: !foundToken || isObserved,
                action: () => {
                    if (foundToken) {
                        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                            token: foundToken,
                        })
                    } else {
                        showWarningToast({
                            text1: LL.HEADS_UP(),
                            text2: LL.SEND_ERROR_TOKEN_NOT_FOUND({
                                tokenName: token.symbol,
                            }),
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
            {
                name: LL.BTN_SWAP(),
                disabled: !foundToken || isObserved,
                action: () => {
                    if (foundToken) {
                        nav.navigate(Routes.SWAP)
                    } else {
                        showWarningToast({
                            text1: LL.HEADS_UP(),
                            text2: LL.SEND_ERROR_TOKEN_NOT_FOUND({
                                tokenName: token.symbol,
                            }),
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
            {
                name: LL.COMMON_RECEIVE(),
                action: openQRCodeSheet,
                icon: (
                    <BaseIcon size={16} color={theme.colors.actionBanner.buttonTextSecondary} name="icon-arrow-down" />
                ),
                testID: "reciveButton",
            },
            {
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
        ],
        [
            LL,
            foundToken,
            isObserved,
            nav,
            openFastActionsSheet,
            openQRCodeSheet,
            theme.colors.actionBanner.buttonTextDisabled,
            theme.colors.actionBanner.buttonTextSecondary,
            token.symbol,
        ],
    )

    const ActionsBottomSheet: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_BUY(),
                action: () => {
                    nav.navigate(Routes.BUY_FLOW)
                },
                icon: actionBottomSheetIcon("icon-plus-circle"),
                testID: "buyButton",
            },
            {
                name: LL.BTN_SEND(),
                disabled: !foundToken || isObserved,
                action: () => {
                    if (foundToken) {
                        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                            token: foundToken,
                        })
                    } else {
                        showWarningToast({
                            text1: LL.HEADS_UP(),
                            text2: LL.SEND_ERROR_TOKEN_NOT_FOUND({
                                tokenName: token.symbol,
                            }),
                        })
                    }
                },
                icon: actionBottomSheetIcon("icon-arrow-up", !foundToken),
                testID: "sendButton",
            },
            {
                name: LL.BTN_SWAP(),
                disabled: !foundToken || isObserved,
                action: () => {
                    if (foundToken) {
                        nav.navigate(Routes.SWAP)
                    } else {
                        showWarningToast({
                            text1: LL.HEADS_UP(),
                            text2: LL.SEND_ERROR_TOKEN_NOT_FOUND({
                                tokenName: token.symbol,
                            }),
                        })
                    }
                },
                icon: actionBottomSheetIcon("icon-arrow-left-right", !foundToken),
                testID: "swapButton",
            },
            {
                name: LL.COMMON_RECEIVE(),
                action: openQRCodeSheet,
                icon: actionBottomSheetIcon("icon-arrow-down"),
                testID: "reciveButton",
            },
            {
                name: LL.BTN_SELL(),
                disabled: !foundToken || isObserved,
                action: openQRCodeSheet,
                icon: actionBottomSheetIcon("icon-minus-circle", !foundToken),
                testID: "sellButton",
            },
        ],
        [LL, actionBottomSheetIcon, foundToken, isObserved, nav, openQRCodeSheet, token.symbol],
    )

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
        <BaseView style={styles.nonVbdContainer}>
            {renderFiatBalance}
            <AssetActionsBar actions={Actions} />
            <FastActionsBottomSheet
                ref={FastActionsBottomSheetRef}
                actions={ActionsBottomSheet}
                closeBottomSheet={closeFastActionsSheet}
            />
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        nonVbdContainer: {
            paddingHorizontal: 16,
            gap: 16,
        },
    })
