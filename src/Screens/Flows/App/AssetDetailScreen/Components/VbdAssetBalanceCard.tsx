import React, { memo, useMemo } from "react"
import {
    selectB3trTokenWithBalance,
    selectBalanceForToken,
    selectNetworkVBDTokens,
    useAppSelector,
} from "~Storage/Redux"
import { TokenWithCompleteInfo, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { BalanceUtils } from "~Utils"
import { BalanceView } from "~Screens/Flows/App/AssetDetailScreen/Components/BalanceView"
import { BaseIcon, BaseSkeleton, BaseText, BaseView, FiatBalance, showWarningToast } from "~Components"
import { AssetActionsBar } from "~Screens/Flows/App/AssetDetailScreen/Components/AssetActionsBar"
import { FastAction } from "~Model"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { StyleSheet } from "react-native"
import { ColorThemeType } from "~Constants"

type Props = {
    b3trToken: TokenWithCompleteInfo
    isBalanceVisible: boolean
}

export const VbdAssetBalanceCard = memo(({ b3trToken, isBalanceVisible }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const vot3RawBalance = useAppSelector(state => selectBalanceForToken(state, VOT3.address))
    const b3trWithBalance = useAppSelector(state => selectB3trTokenWithBalance(state))
    const vot3Token = useTokenWithCompleteInfo(VOT3)
    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        b3trToken.exchangeRate ?? 0,
        VOT3.decimals,
    )
    const isLoading =
        b3trToken.exchangeRateLoading ||
        b3trToken.tokenInfoLoading ||
        vot3Token.exchangeRateLoading ||
        vot3Token.tokenInfoLoading

    const veB3trFiatBalance = Number(vot3FiatBalance) + Number(b3trToken.fiatBalance)

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
                disabled: !veB3trFiatBalance,
                action: () => {
                    if (veB3trFiatBalance) {
                        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                            token: b3trWithBalance,
                        })
                    } else {
                        showWarningToast({
                            text1: LL.HEADS_UP(),
                            text2: LL.SEND_ERROR_TOKEN_NOT_FOUND({
                                tokenName: b3trToken.symbol,
                            }),
                        })
                    }
                },
                icon: (
                    <BaseIcon
                        size={16}
                        color={
                            b3trWithBalance
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
                disabled: !veB3trFiatBalance,
                action: () => {
                    if (veB3trFiatBalance) {
                        nav.navigate(Routes.SWAP)
                    } else {
                        showWarningToast({
                            text1: LL.HEADS_UP(),
                            text2: LL.SEND_ERROR_TOKEN_NOT_FOUND({
                                tokenName: b3trToken.symbol,
                            }),
                        })
                    }
                },
                icon: (
                    <BaseIcon
                        color={
                            b3trWithBalance
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
            b3trToken.symbol,
            b3trWithBalance,
            nav,
            theme.colors.actionBanner.buttonTextDisabled,
            theme.colors.actionBanner.buttonTextSecondary,
            veB3trFiatBalance,
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
            <FiatBalance
                typographyFont={"subSubTitleSemiBold"}
                color={theme.colors.assetDetailsCard.title}
                balances={[veB3trFiatBalance.toString()]}
                isVisible={isBalanceVisible}
            />
        )
    }, [
        isLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        theme.colors.assetDetailsCard.title,
        b3trToken.exchangeRate,
        LL,
        veB3trFiatBalance,
        isBalanceVisible,
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
                <BaseView flexGrow={2}>{renderFiatBalance}</BaseView>
                <BaseView flexGrow={1}>
                    <AssetActionsBar actions={Actions} />
                </BaseView>
            </BaseView>
            <BaseView style={styles.b3trRowContainer}>
                <BaseView flexDirection="row">
                    <BalanceView
                        containerStyle={styles.b3trBalanceView}
                        tokenWithInfo={b3trToken}
                        isBalanceVisible={isBalanceVisible}
                    />
                    <BaseIcon name="icon-more-vertical" size={16} style={styles.moreActionsButton} />
                    <BaseView />
                </BaseView>
            </BaseView>
            <BaseView px={16} pt={16}>
                <BalanceView tokenWithInfo={vot3BalanceProps} isBalanceVisible={isBalanceVisible} />
            </BaseView>
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
            alignSelf: "baseline",
            padding: 16,
            borderBottomWidth: 1,
            flex: 1,
            gap: 16,
            borderColor: theme.colors.cardDivider,
        },
        b3trBalanceView: {
            flexDirection: "row",
        },
        moreActionsButton: {
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            borderColor: theme.colors.actionBanner.buttonBorder,
            height: 32,
            width: 32,
            borderWidth: 1,
            padding: 8,
            borderRadius: 6,
        },
    })
