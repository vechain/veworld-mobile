import { useNavigation } from "@react-navigation/native"
import { default as React, useMemo } from "react"
import { StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseSkeleton,
    BaseText,
    BaseView,
    DisabledBuySwapIosBottomSheet,
    showWarningToast,
} from "~Components"
import { TokenWithCompleteInfo, useBottomSheetModal, useThemedStyles, useTokenCardFiatInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FastAction, FungibleTokenWithBalance } from "~Model"
import { Routes } from "~Navigation"
import { PlatformUtils } from "~Utils"
import { ActionsButtonGroup } from "./ActionsButtonGroup"
import { BalanceView } from "./BalanceView"

type Props = {
    token: TokenWithCompleteInfo
    isBalanceVisible: boolean
    isObserved: boolean
    openQRCodeSheet: () => void
    foundToken?: FungibleTokenWithBalance
}

export const BridgeTokenBalanceCard = ({ token, isBalanceVisible, foundToken, openQRCodeSheet, isObserved }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const { change24h, exchangeRate, isPositive24hChange, isLoading } = useTokenCardFiatInfo(token)

    const {
        ref: blockedFeaturesIOSBottomSheetRef,
        onOpen: openBlockedFeaturesIOSBottomSheet,
        onClose: closeBlockedFeaturesIOSBottomSheet,
    } = useBottomSheetModal()

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
                    if (PlatformUtils.isIOS()) {
                        openBlockedFeaturesIOSBottomSheet()
                        return
                    }

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
        }),
        [
            LL,
            foundToken,
            isObserved,
            nav,
            openBlockedFeaturesIOSBottomSheet,
            openQRCodeSheet,
            theme.colors.actionBanner.buttonTextDisabled,
            theme.colors.actionBanner.buttonTextSecondary,
        ],
    )

    const actions = useMemo(() => [Actions.send, Actions.swap, Actions.receive], [Actions])

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
            <ActionsButtonGroup actions={actions} />
            <DisabledBuySwapIosBottomSheet
                ref={blockedFeaturesIOSBottomSheetRef}
                onConfirm={closeBlockedFeaturesIOSBottomSheet}
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
