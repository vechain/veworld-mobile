import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useEffect, useMemo } from "react"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { AlertInline, BaseSpacer, BaseText, BaseView, Layout, QRCodeBottomSheet } from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { AssetChart, MarketInfoView } from "./Components"
import { useI18nContext } from "~i18n"
import striptags from "striptags"
import {
    selectBalanceVisible,
    selectSelectedAccount,
    selectSendableTokensWithBalance,
    useAppSelector,
} from "~Storage/Redux"
import { ScrollView } from "react-native-gesture-handler"
import { StyleSheet } from "react-native"
import { AccountUtils } from "~Utils"
import { B3TR, typography } from "~Constants"
import { AssetBalanceCard } from "./Components/AssetBalanceCard"
import { ConvertBetterTokenSuccessBottomSheet } from "./ConvertBetterScreen/Components"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

const { defaults: defaultTypography } = typography

export const AssetDetailScreen = ({ route }: Props) => {
    const { token, betterConversionResult } = route.params
    const { styles } = useThemedStyles(baseStyles)
    const { LL, locale } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } = useBottomSheetModal()

    const {
        ref: convertBetterSuccessBottomSheetRef,
        onOpen: openConvertSuccessBetterSheet,
        onClose: closeConvertSuccessBetterSheet,
    } = useBottomSheetModal()

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const tokens = useAppSelector(selectSendableTokensWithBalance)
    const foundToken = tokens.find(
        t =>
            t.name?.toLowerCase().includes(token.name.toLowerCase()) ||
            t.symbol?.toLowerCase().includes(token.symbol.toLowerCase()),
    )

    const tokenName = useMemo(
        () => (token.symbol === B3TR.symbol ? LL.TITLE_VEBETTER() : token.name),
        [LL, token.name, token.symbol],
    )

    // render description based on locale. NB: at the moment only EN is supported
    const description = useMemo(() => {
        if (!token?.tokenInfo?.description) return ""

        return token?.tokenInfo?.description[locale] ?? token?.tokenInfo?.description.en
    }, [token?.tokenInfo?.description, locale])

    const isObserved = useMemo(() => AccountUtils.isObservedAccount(selectedAccount), [selectedAccount])

    useEffect(() => {
        if (betterConversionResult?.isSuccess) {
            openConvertSuccessBetterSheet()
        }
    }, [betterConversionResult, openConvertSuccessBetterSheet])

    return (
        <Layout
            title={tokenName}
            fixedBody={
                <ScrollView>
                    <BaseSpacer height={16} />
                    <AssetChart token={token} />

                    <BaseView alignItems="center" style={styles.assetDetailsBody}>
                        <BaseSpacer height={40} />

                        <AssetBalanceCard
                            tokenWithInfo={token}
                            foundToken={foundToken}
                            isBalanceVisible={isBalanceVisible}
                            openQRCodeSheet={openQRCodeSheet}
                            isObserved={isObserved}
                        />

                        {token.symbol === B3TR.symbol && (
                            <BaseView w={100}>
                                <BaseSpacer height={16} />
                                <AlertInline status="info" variant="inline" message={LL.ALERT_MSG_VOT3_BALANCE()} />
                            </BaseView>
                        )}

                        <BaseSpacer height={40} />

                        {/* TODO: handle loading/skeleton */}
                        {!!description && (
                            <>
                                <BaseText
                                    typographyFont="bodySemiBold"
                                    align="left"
                                    alignContainer="flex-start"
                                    w={100}
                                    mb={12}>
                                    {LL.TITLE_ABOUT()} {tokenName}
                                </BaseText>

                                <BaseText style={styles.tokenInfoText}>
                                    {striptags(description.trim(), ["strong"])}
                                </BaseText>
                            </>
                        )}

                        <BaseSpacer height={24} />

                        <MarketInfoView tokenSymbol={token.symbol} />
                        <BaseSpacer height={16} />
                    </BaseView>
                    <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />

                    <ConvertBetterTokenSuccessBottomSheet
                        ref={convertBetterSuccessBottomSheetRef}
                        onClose={closeConvertSuccessBetterSheet}
                        {...betterConversionResult}
                    />
                </ScrollView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        assetDetailsBody: {
            paddingHorizontal: 16,
        },
        tokenInfoText: {
            lineHeight: defaultTypography.bodySemiBold.lineHeight,
        },
    })
