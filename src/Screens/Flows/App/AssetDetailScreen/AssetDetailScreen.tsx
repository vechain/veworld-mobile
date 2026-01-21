import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { RefObject, useCallback, useEffect, useMemo } from "react"
import { StyleSheet } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import striptags from "striptags"
import { AlertInline, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { B3TR, VET } from "~Constants"
import { typography } from "~Constants/Theme"
import { useBottomSheetModal, useBottomSheetRef, useCameraBottomSheet, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { BannersCarousel } from "~Screens"
import { selectBalanceVisible, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { AssetChart, ConvertedBetterBottomSheet, MarketInfoView } from "./Components"
import { AssetBalanceCard } from "./Components/AssetBalanceCard"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

const { defaults: defaultTypography } = typography

export const AssetDetailScreen = ({ route }: Props) => {
    const { token, betterConversionResult } = route.params
    const { styles } = useThemedStyles(baseStyles)
    const { LL, locale } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { RenderCameraModal, handleOpenOnlyReceiveCamera } = useCameraBottomSheet({ targets: [] })

    const {
        ref: convertBetterSuccessBottomSheetRef,
        onOpen: openConvertSuccessBetterSheet,
        onClose: closeConvertSuccessBetterSheet,
    } = useBottomSheetModal()

    const convertB3trBsRef = useBottomSheetRef()

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const tokenWithBalance = useMemo(() => {
        if (!token.balance) return
        return token as FungibleTokenWithBalance
    }, [token])

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
                            tokenWithInfo={token}
                            foundToken={tokenWithBalance}
                            isBalanceVisible={isBalanceVisible}
                            openQRCodeSheet={handleOpenOnlyReceiveCamera}
                            isObserved={isObserved}
                            convertB3trBottomSheetRef={convertB3trBsRef as RefObject<BottomSheetModalMethods>}
                        />
                        <BaseSpacer height={16} />

                        {token.symbol === B3TR.symbol && (
                            <BaseView w={100}>
                                <AlertInline status="info" variant="inline" message={LL.ALERT_MSG_VOT3_BALANCE()} />
                                <BaseSpacer height={16} />
                            </BaseView>
                        )}

                        {token.symbol === VET.symbol && <BannersCarousel location="token_screen" />}

                        <BaseSpacer height={40} />

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
                    {RenderCameraModal}

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
