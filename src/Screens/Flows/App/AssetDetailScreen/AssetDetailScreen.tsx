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
    FastActionsBar,
    Layout,
    QRCodeBottomSheet,
    showWarningToast,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { AssetChart, AssetHeader, BalanceView, MarketInfoView } from "./Components"
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

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

export const AssetDetailScreen = ({ route }: Props) => {
    const token = route.params.token
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { LL, locale } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } = useBottomSheetModal()

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const tokens = useAppSelector(selectSendableTokensWithBalance)
    const foundToken = tokens.find(
        t =>
            t.name?.toLowerCase().includes(token.name.toLowerCase()) ||
            t.symbol?.toLowerCase().includes(token.symbol.toLowerCase()),
    )

    // render description based on locale. NB: at the moment only EN is supported
    const description = useMemo(() => {
        if (!token?.tokenInfo?.description) return ""

        return token?.tokenInfo?.description[locale] ?? token?.tokenInfo?.description.en
    }, [token?.tokenInfo?.description, locale])

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_SEND(),
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
                icon: <BaseIcon color={theme.colors.text} name="icon-send" />,
                testID: "sendButton",
            },

            {
                name: LL.COMMON_RECEIVE(),
                action: openQRCodeSheet,
                icon: <BaseIcon color={theme.colors.text} name="icon-qr-code" />,
                testID: "reciveButton",
            },
        ],
        [LL, foundToken, nav, openQRCodeSheet, theme.colors.text, token.symbol],
    )

    const showActions = useMemo(() => !AccountUtils.isObservedAccount(selectedAccount), [selectedAccount])

    return (
        <Layout
            noBackButton
            fixedHeader={<AssetHeader name={token.name} symbol={token.symbol} icon={token.icon} />}
            fixedBody={
                <ScrollView>
                    <BaseView style={styles.assetDetailsHeader}>
                        {token.symbol === B3TR.symbol && (
                            <AlertInline status="info" variant="inline" message={LL.ALERT_TITLE_INVALID_CHARTS()} />
                        )}

                        <BaseSpacer height={24} />
                    </BaseView>
                    <AssetChart token={token} />

                    <BaseView alignItems="center" style={styles.assetDetailsBody}>
                        <BaseSpacer height={24} />

                        {showActions && (
                            <>
                                <FastActionsBar actions={Actions} />
                                <BaseSpacer height={24} />
                            </>
                        )}

                        <BalanceView tokenWithInfo={token} isBalanceVisible={isBalanceVisible} />

                        <BaseSpacer height={24} />

                        <MarketInfoView tokenSymbol={token.symbol} />

                        <BaseSpacer height={24} />

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

                                <BaseText mb={25}>
                                    {striptags(description.trim(), {
                                        allowedTags: new Set(["strong"]),
                                    })}
                                </BaseText>
                            </>
                        )}
                    </BaseView>
                    <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />
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
