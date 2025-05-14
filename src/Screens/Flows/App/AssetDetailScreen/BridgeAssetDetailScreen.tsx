import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { AlertInline, BaseSpacer, BaseText, BaseView, Layout, QRCodeBottomSheet } from "~Components"
import { B3TR } from "~Constants"
import { typography } from "~Constants/Theme"
import { useBottomSheetModal, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import striptags from "striptags"
import {
    selectBalanceVisible,
    selectSelectedAccount,
    selectSendableTokensWithBalance,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { AssetChart, MarketInfoView } from "./Components"
import { AssetBalanceCard } from "./Components/AssetBalanceCard"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.BRIDGE_TOKEN_DETAILS>

const { defaults: defaultTypography } = typography

export const BridgeAssetDetailScreen = ({ route }: Props) => {
    const { token } = route.params
    const { styles } = useThemedStyles(baseStyles)
    const { LL, locale } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const tokenWithCompleteInfo = useTokenWithCompleteInfo(token)

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } = useBottomSheetModal()

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const tokens = useAppSelector(selectSendableTokensWithBalance)
    const foundToken = tokens.find(
        t =>
            t.name?.toLowerCase().includes(token.name.toLowerCase()) ||
            t.symbol?.toLowerCase().includes(token.symbol.toLowerCase()),
    )

    const tokenLabel = useMemo(() => {
        switch (token.symbol) {
            case "BTC":
                return "VeBitcoin"
            case "ETH":
                return "VeEthereum"
            case "SOL":
                return "VeSolana"
            case "XRP":
                return "VeRipple"
            case "WAN":
                return "VeWanchain"
            case "USDT":
                return "VeTether"
            case "USDC":
                return "VeUSDC"
            default:
                return token.name
        }
    }, [token.symbol, token.name])

    // render description based on locale. NB: at the moment only EN is supported
    const description = useMemo(() => {
        if (!tokenWithCompleteInfo?.tokenInfo?.description) return ""

        return tokenWithCompleteInfo?.tokenInfo?.description[locale] ?? tokenWithCompleteInfo?.tokenInfo?.description.en
    }, [tokenWithCompleteInfo?.tokenInfo?.description, locale])

    const isObserved = useMemo(() => AccountUtils.isObservedAccount(selectedAccount), [selectedAccount])

    return (
        <Layout
            title={tokenLabel}
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
                        />

                        {token.symbol === B3TR.symbol && (
                            <BaseView w={100}>
                                <BaseSpacer height={16} />
                                <AlertInline status="info" variant="inline" message={LL.ALERT_MSG_VOT3_BALANCE()} />
                            </BaseView>
                        )}

                        <BaseSpacer height={40} />

                        {/* TODO: render the right description based on the token symbol */}
                        {!!description && (
                            <>
                                <BaseText
                                    typographyFont="bodySemiBold"
                                    align="left"
                                    alignContainer="flex-start"
                                    w={100}
                                    mb={12}>
                                    {LL.TITLE_ABOUT()} {tokenLabel}
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
