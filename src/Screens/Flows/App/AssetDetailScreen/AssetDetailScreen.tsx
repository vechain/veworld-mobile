import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo } from "react"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import {
    AlertInline,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    QRCodeBottomSheet,
    FastActionsBottomSheet,
    showWarningToast,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { AssetActionsBar, AssetChart, MarketInfoView } from "./Components"
import { useI18nContext } from "~i18n"
import { FastAction } from "~Model"
import { striptags } from "striptags"
import {
    selectBalanceVisible,
    selectSelectedAccount,
    selectSendableTokensWithBalance,
    useAppSelector,
} from "~Storage/Redux"
import { ScrollView } from "react-native-gesture-handler"
import { StyleSheet } from "react-native"
import { AccountUtils } from "~Utils"
import { B3TR } from "~Constants"
import { AssetBalanceCard } from "./Components/AssetBalanceCard"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

export const AssetDetailScreen = ({ route }: Props) => {
    const token = route.params.token
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { LL, locale } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } = useBottomSheetModal()
    const {
        ref: FastActionsBottomSheetRef,
        onOpen: openFastActionsSheet,
        onClose: closeFastActionsSheet,
    } = useBottomSheetModal()

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const tokens = useAppSelector(selectSendableTokensWithBalance)
    const foundToken = tokens.find(
        t =>
            t.name?.toLowerCase().includes(token.name.toLowerCase()) ||
            t.symbol?.toLowerCase().includes(token.symbol.toLowerCase()),
    )

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
                disabled: !foundToken,
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
                disabled: !foundToken,
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
                        size={16}
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
            nav,
            openFastActionsSheet,
            openQRCodeSheet,
            theme.colors.actionBanner.buttonTextDisabled,
            theme.colors.actionBanner.buttonTextSecondary,
            token.symbol,
        ],
    )

    // render description based on locale. NB: at the moment only EN is supported
    const description = useMemo(() => {
        if (!token?.tokenInfo?.description) return ""

        return token?.tokenInfo?.description[locale] ?? token?.tokenInfo?.description.en
    }, [token?.tokenInfo?.description, locale])

    const showActions = useMemo(() => !AccountUtils.isObservedAccount(selectedAccount), [selectedAccount])

    return (
        <Layout
            title={token.name}
            fixedBody={
                <ScrollView>
                    <BaseView style={styles.assetDetailsHeader}>
                        {token.symbol === B3TR.symbol && (
                            <>
                                <AlertInline status="info" variant="inline" message={LL.ALERT_TITLE_INVALID_CHARTS()} />
                                <BaseSpacer height={24} />
                            </>
                        )}
                    </BaseView>
                    <AssetChart token={token} />

                    <BaseView alignItems="center" style={styles.assetDetailsBody}>
                        <BaseSpacer height={40} />

                        <AssetBalanceCard
                            tokenWithInfo={token}
                            isBalanceVisible={isBalanceVisible}
                            FastActions={showActions && <AssetActionsBar actions={Actions} />}
                        />

                        <BaseSpacer height={40} />

                        {/* TODO: handle loading/skeleton */}
                        {!!description && (
                            <>
                                <BaseText
                                    typographyFont="bodyBold"
                                    align="left"
                                    alignContainer="flex-start"
                                    w={100}
                                    mb={12}>
                                    {LL.TITLE_ABOUT()} {token.name}
                                </BaseText>

                                <BaseText>
                                    {striptags(description.trim(), {
                                        allowedTags: new Set(["strong"]),
                                    })}
                                </BaseText>
                            </>
                        )}

                        <BaseSpacer height={24} />

                        <MarketInfoView tokenSymbol={token.symbol} />
                        <BaseSpacer height={16} />
                    </BaseView>
                    <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />
                    <FastActionsBottomSheet
                        ref={FastActionsBottomSheetRef}
                        actions={Actions}
                        closeBottomSheet={closeFastActionsSheet}
                    />
                </ScrollView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        assetDetailsHeader: {
            marginHorizontal: 16,
            marginTop: 24,
            width: "85%",
        },
        assetDetailsBody: {
            paddingHorizontal: 16,
        },
    })
