import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import Markdown from "react-native-markdown-display"
import { AlertInline, BaseSpacer, BaseText, BaseView, Layout, QRCodeBottomSheet } from "~Components"
import { B3TR } from "~Constants"
import { ColorThemeType, typography } from "~Constants/Theme"
import { useBottomSheetModal, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
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
    const { LL } = useI18nContext()
    const navigation = useNavigation()
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

    const isObserved = useMemo(() => AccountUtils.isObservedAccount(selectedAccount), [selectedAccount])

    const tokenLabel = useMemo(() => {
        switch (token.symbol) {
            case "BTC":
                return "Bitcoin"
            case "ETH":
                return "Ethereum"
            case "SOL":
                return "Solana"
            case "XRP":
                return "Ripple"
            case "WAN":
                return "Wanchain"
            case "USDT":
                return "Tether"
            case "USDC":
                return "USDC"
            default:
                return token.name
        }
    }, [token.symbol, token.name])

    const tokenDescription = useMemo(() => {
        return token.symbol === "USDT" || token.symbol === "USDC"
            ? LL.ABOUT_BRIDGE_USD_TOKEN({
                  label: tokenLabel,
                  name: token.name,
                  symbol: token.symbol,
                  url: token.crossChainProvider?.url ?? "",
              })
            : LL.ABOUT_BRIDGE_TOKEN({
                  label: tokenLabel,
                  name: token.name,
                  symbol: token.symbol,
                  url: token.crossChainProvider?.url ?? "",
              })
    }, [token.symbol, token.name, token.crossChainProvider?.url, tokenLabel, LL])

    return (
        <Layout
            title={token.name}
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

                        <BaseText
                            typographyFont="bodySemiBold"
                            align="left"
                            alignContainer="flex-start"
                            w={100}
                            mb={12}>
                            {LL.TITLE_ABOUT()} {token.name}
                        </BaseText>

                        <Markdown
                            style={{ body: styles.markdownText }}
                            onLinkPress={url => {
                                navigation.navigate(Routes.BROWSER, { url })
                                return false
                            }}>
                            {tokenDescription}
                        </Markdown>

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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        assetDetailsBody: {
            paddingHorizontal: 16,
        },
        markdownText: {
            color: theme.colors.text,
            lineHeight: defaultTypography.bodySemiBold.lineHeight,
        },
    })
