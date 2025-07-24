import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useEffect, useMemo } from "react"
import { StyleSheet } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import striptags from "striptags"
import { AlertInline, BaseSpacer, BaseText, BaseView, Layout, QRCodeBottomSheet } from "~Components"
import { B3TR, VET } from "~Constants"
import { typography } from "~Constants/Theme"
import { useBottomSheetModal, useBottomSheetRef, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    selectBalanceVisible,
    selectSelectedAccount,
    selectSendableTokensWithBalance,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { AssetChart, ConvertedBetterBottomSheet, MarketInfoView } from "./Components"
import { AssetBalanceCard } from "./Components/AssetBalanceCard"
import { StargateCarousel } from "./Components/StargateCarousel"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

const { defaults: defaultTypography } = typography

export const AssetDetailScreen = ({ route }: Props) => {
    const { token, betterConversionResult } = route.params
    const { styles } = useThemedStyles(baseStyles)
    const { LL, locale } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const tokenWithCompleteInfo = useTokenWithCompleteInfo(token)

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } = useBottomSheetModal()

    const {
        ref: convertBetterSuccessBottomSheetRef,
        onOpen: openConvertSuccessBetterSheet,
        onClose: closeConvertSuccessBetterSheet,
    } = useBottomSheetModal()

    const convertB3trBsRef = useBottomSheetRef()

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
        if (!tokenWithCompleteInfo?.tokenInfo?.description) return ""

        return tokenWithCompleteInfo?.tokenInfo?.description[locale] ?? tokenWithCompleteInfo?.tokenInfo?.description.en
    }, [tokenWithCompleteInfo?.tokenInfo?.description, locale])

    const isObserved = useMemo(() => AccountUtils.isObservedAccount(selectedAccount), [selectedAccount])

    const onFailedConversion = useCallback(() => {
        closeConvertSuccessBetterSheet()
        convertB3trBsRef.current?.present()
    }, [closeConvertSuccessBetterSheet, convertB3trBsRef])

    useEffect(() => {
        if (betterConversionResult) {
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
                            tokenWithInfo={tokenWithCompleteInfo}
                            foundToken={foundToken}
                            isBalanceVisible={isBalanceVisible}
                            openQRCodeSheet={openQRCodeSheet}
                            isObserved={isObserved}
                            convertB3trBottomSheetRef={convertB3trBsRef}
                        />

                        {token.symbol === B3TR.symbol && (
                            <BaseView w={100}>
                                <BaseSpacer height={16} />
                                <AlertInline status="info" variant="inline" message={LL.ALERT_MSG_VOT3_BALANCE()} />
                            </BaseView>
                        )}

                        <BaseSpacer height={40} />
                        {token.symbol === VET.symbol && <StargateCarousel />}

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

                    <ConvertedBetterBottomSheet
                        ref={convertBetterSuccessBottomSheetRef}
                        onClose={closeConvertSuccessBetterSheet}
                        onFailure={onFailedConversion}
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
