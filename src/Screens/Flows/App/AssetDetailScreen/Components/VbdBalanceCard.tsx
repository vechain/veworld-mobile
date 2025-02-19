import React, { memo, useMemo } from "react"
import { selectNetworkVBDTokens, selectVot3TokenWithBalance, useAppSelector } from "~Storage/Redux"
import { useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { BalanceUtils } from "~Utils"
import { BalanceView } from "./BalanceView"
import { BaseIcon, BaseSkeleton, BaseText, BaseView, FiatBalance, showWarningToast } from "~Components"
import { AssetActionsBar } from "./AssetActionsBar"
import { FastAction } from "~Model"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { StyleSheet } from "react-native"
import { ColorThemeType } from "~Constants"
import { useTokenCardFiatInfo } from "~Screens/Flows/App/HomeScreen/Components/ListsView/Token/useTokenCardFiatInfo"

type Props = {
    isBalanceVisible: boolean
}

export const VbdBalanceCard = memo(({ isBalanceVisible }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const vot3TokenWithBalance = useAppSelector(state => selectVot3TokenWithBalance(state))
    const b3trTokenWithBalance = useAppSelector(state => selectVot3TokenWithBalance(state))

    const vot3Token = useTokenWithCompleteInfo(VOT3)
    const b3trToken = useTokenWithCompleteInfo(B3TR)

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

    const veB3trFiatBalance = Number(vot3FiatBalance) + Number(b3trFiat)

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
                disabled: !veB3trFiatBalance,
                action: () => {
                    if (veB3trFiatBalance) {
                        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                            token: b3trTokenWithBalance,
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
                            b3trTokenWithBalance
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
                            b3trTokenWithBalance
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
            b3trTokenWithBalance,
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
            <>
                <FiatBalance
                    typographyFont={"subSubTitleSemiBold"}
                    color={theme.colors.assetDetailsCard.title}
                    balances={[veB3trFiatBalance.toString()]}
                    isVisible={isBalanceVisible}
                />
                {!!veB3trFiatBalance && (
                    <BaseText
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
        veB3trFiatBalance,
        isBalanceVisible,
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
                    <AssetActionsBar actions={Actions} />
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
                        action={() => {}}
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
            height: 32,
            width: 32,
            borderWidth: 1,
            borderRadius: 6,
        },
    })
