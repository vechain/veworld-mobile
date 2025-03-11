import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseSkeleton,
    BaseText,
    BaseView,
    FastActionsBottomSheet,
    FiatBalance,
    showWarningToast,
} from "~Components"
import { ColorThemeType } from "~Constants"
import {
    useBottomSheetModal,
    useCombineFiatBalances,
    useThemedStyles,
    useTokenCardFiatInfo,
    useTokenWithCompleteInfo,
} from "~Hooks"
import { FastAction, IconKey } from "~Model"
import { Routes } from "~Navigation"
import {
    selectB3trTokenWithBalance,
    selectNetworkVBDTokens,
    selectVot3TokenWithBalance,
    useAppSelector,
} from "~Storage/Redux"
import { BalanceUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { ConvertBetterBottomSheet } from "../../ConvertBetterBottomSheet/ConvertBetterBottomSheet"
import { ActionsButtonGroup } from "./ActionsButtonGroup"
import { BalanceView } from "./BalanceView"

type Props = {
    isBalanceVisible: boolean
    isObserved: boolean
    openQRCodeSheet: () => void
}

export const VbdBalanceCard = memo(({ isBalanceVisible, openQRCodeSheet, isObserved }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const vot3TokenWithBalance = useAppSelector(state => selectVot3TokenWithBalance(state))
    const b3trTokenWithBalance = useAppSelector(state => selectB3trTokenWithBalance(state))

    const {
        ref: FastActionsBottomSheetRef,
        onOpen: openFastActionsSheet,
        onClose: closeFastActionsSheet,
    } = useBottomSheetModal()

    const {
        ref: convertBetterBottomSheetRef,
        openWithDelay: openDelayConvertBetterSheet,
        onOpen: openConvertBetterSheet,
        onClose: closeConvertBetterSheet,
    } = useBottomSheetModal()

    const vot3Token = useTokenWithCompleteInfo(VOT3)
    const b3trToken = useTokenWithCompleteInfo(B3TR)

    const { combineFiatBalances } = useCombineFiatBalances()

    const {
        exchangeRate,
        isPositive24hChange,
        change24h,
        isLoading,
        fiatBalance: b3trFiat,
    } = useTokenCardFiatInfo(b3trToken)

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3TokenWithBalance?.balance.balance ?? "0",
        exchangeRate ?? 0,
        VOT3.decimals,
    )

    const balances = useMemo(() => [b3trFiat, vot3FiatBalance], [b3trFiat, vot3FiatBalance])

    const { amount: veB3trFiatBalance } = useMemo(() => combineFiatBalances(balances), [balances, combineFiatBalances])

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
                disabled: !veB3trFiatBalance || isObserved,
                action: () => {
                    if (veB3trFiatBalance) {
                        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                            token: b3trTokenWithBalance,
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
                            veB3trFiatBalance && !isObserved
                                ? theme.colors.actionBanner.buttonTextSecondary
                                : theme.colors.actionBanner.buttonTextDisabled
                        }
                        name="icon-arrow-up"
                    />
                ),
                testID: "sendButton",
            },
            {
                name: LL.BTN_CONVERT(),
                disabled: !veB3trFiatBalance || isObserved,
                action: openConvertBetterSheet,
                icon: (
                    <BaseIcon
                        color={
                            veB3trFiatBalance && !isObserved
                                ? theme.colors.actionBanner.buttonTextSecondary
                                : theme.colors.actionBanner.buttonTextDisabled
                        }
                        name="icon-refresh-cw"
                        size={16}
                    />
                ),
                testID: "convertButton",
            },
        ],
        [
            LL,
            b3trTokenWithBalance,
            isObserved,
            nav,
            openConvertBetterSheet,
            theme.colors.actionBanner.buttonTextDisabled,
            theme.colors.actionBanner.buttonTextSecondary,
            veB3trFiatBalance,
        ],
    )

    const ActionsBottomSheet: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
                disabled: !b3trTokenWithBalance || isObserved,
                action: () => {
                    if (veB3trFiatBalance) {
                        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                            token: b3trTokenWithBalance,
                        })
                    } else {
                        showWarningToast({
                            text1: LL.ALERT_MSG_NO_FUNDS(),
                        })
                    }
                },
                icon: actionBottomSheetIcon("icon-arrow-up", !b3trTokenWithBalance),
                testID: "sendButton",
            },
            {
                name: LL.BTN_CONVERT(),
                disabled: !veB3trFiatBalance || isObserved,
                action: () => {
                    FastActionsBottomSheetRef.current?.forceClose()
                    openDelayConvertBetterSheet(350)
                },
                icon: actionBottomSheetIcon("icon-refresh-cw", !veB3trFiatBalance),
                testID: "convertButton",
            },
            {
                name: LL.BTN_SWAP(),
                disabled: !b3trTokenWithBalance || isObserved,
                action: () => {
                    if (veB3trFiatBalance) {
                        nav.navigate(Routes.SWAP)
                    } else {
                        showWarningToast({
                            text1: LL.ALERT_MSG_NO_FUNDS(),
                        })
                    }
                },
                icon: actionBottomSheetIcon("icon-arrow-left-right", !b3trTokenWithBalance),
                testID: "swapButton",
            },
            {
                name: LL.COMMON_RECEIVE(),
                action: openQRCodeSheet,
                icon: actionBottomSheetIcon("icon-arrow-down"),
                testID: "reciveButton",
            },
        ],
        [
            LL,
            b3trTokenWithBalance,
            isObserved,
            actionBottomSheetIcon,
            veB3trFiatBalance,
            openQRCodeSheet,
            nav,
            FastActionsBottomSheetRef,
            openDelayConvertBetterSheet,
        ],
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
        if (!b3trToken.exchangeRate)
            return <BaseText typographyFont="bodyMedium">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>

        return (
            <>
                <FiatBalance
                    typographyFont={"subSubTitleSemiBold"}
                    color={theme.colors.assetDetailsCard.title}
                    balances={balances}
                    isVisible={isBalanceVisible}
                />
                {!!veB3trFiatBalance && (
                    <BaseText
                        mt={2}
                        typographyFont="captionMedium"
                        color={isPositive24hChange ? theme.colors.positive : theme.colors.negative}>
                        {change24h}
                    </BaseText>
                )}
            </>
        )
    }, [
        isLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        theme.colors.assetDetailsCard.title,
        theme.colors.positive,
        theme.colors.negative,
        b3trToken.exchangeRate,
        LL,
        balances,
        isBalanceVisible,
        veB3trFiatBalance,
        isPositive24hChange,
        change24h,
    ])

    const vot3BalanceProps = useMemo(
        () => ({
            ...vot3Token,
            fiatBalance: vot3FiatBalance,
            exchangeRate: b3trToken.exchangeRate,
            exchangeRateCurrency: b3trToken.exchangeRateCurrency,
            exchangeRateLoading: b3trToken.exchangeRateLoading,
        }),
        [vot3Token, vot3FiatBalance, b3trToken],
    )

    return (
        <>
            <BaseView style={styles.topRow}>
                <BaseView w={40}>{renderFiatBalance}</BaseView>
                <BaseView flexGrow={2}>
                    <ActionsButtonGroup actions={Actions} />
                </BaseView>
            </BaseView>
            <BaseView justifyContent={"space-between"} style={styles.b3trRowContainer}>
                <BalanceView
                    containerStyle={styles.b3trBalanceView}
                    tokenWithInfo={b3trToken}
                    isBalanceVisible={isBalanceVisible}
                />
                <BaseView>
                    <BaseIcon
                        name="icon-more-vertical"
                        size={18}
                        color={theme.colors.actionBanner.buttonTextSecondary}
                        style={styles.moreActionsButton}
                        action={openFastActionsSheet}
                    />
                </BaseView>
                <BaseView />
            </BaseView>
            <BaseView px={16} pt={16}>
                <BalanceView
                    tokenWithInfo={vot3BalanceProps}
                    isBalanceVisible={isBalanceVisible}
                    containerStyle={styles.b3trBalanceView}
                />
            </BaseView>

            <FastActionsBottomSheet
                ref={FastActionsBottomSheetRef}
                actions={ActionsBottomSheet}
                closeBottomSheet={closeFastActionsSheet}
            />

            <ConvertBetterBottomSheet ref={convertBetterBottomSheetRef} onClose={closeConvertBetterSheet} />
        </>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        topRow: {
            flexDirection: "row",
            alignItems: "center",
            borderColor: theme.colors.cardDivider,
            borderBottomWidth: 1,
            paddingBottom: 16,
            paddingHorizontal: 16,
            gap: 12,
        },
        b3trRowContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 1,
            flex: 1,
            borderColor: theme.colors.cardDivider,
        },
        b3trBalanceView: {
            flexDirection: "row",
            alignItems: "center",
            flexGrow: 1,
            flex: 1,
            gap: 12,
        },
        moreActionsButton: {
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            borderColor: theme.colors.actionBanner.buttonBorder,
            height: 34,
            width: 34,
            borderWidth: 1,
            borderRadius: 6,
        },
    })
