import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo } from "react"
import { CoinbasePayWebView, Layout, TransakPayWebView } from "~Components"
import { CoinifyPayWebView } from "~Components/Reusable/CoinifyPayWebView"
import { useTheme } from "~Hooks"
import { DEVICE_TYPE } from "~Model"
import { RootStackParamListBuy, Routes } from "~Navigation"
import { selectSelectedAccountAddress, selectSelectedAccountOrNull, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import { PaymentProvidersEnum } from "../Hooks"

type Props = NativeStackScreenProps<RootStackParamListBuy, Routes.BUY_WEBVIEW>
const isProd = process.env.NODE_ENV === "production"

const isAndroid = PlatformUtils.isAndroid()

export const BuyWebviewScreen: React.FC<Props> = ({ route }) => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const { provider, providerName } = route.params || {}
    const theme = useTheme()

    const ifTest = useMemo(() => (isProd ? "" : " (STAGING)"), [])
    const isLedgerAccount = selectedAccount?.device?.type === DEVICE_TYPE.LEDGER

    if (!selectedAccountAddress) return null

    return (
        <Layout
            hasSafeArea={isAndroid}
            title={`${providerName}${ifTest}`}
            bg={provider === PaymentProvidersEnum.Transak ? theme.colors.transak : undefined}
            fixedBody={
                <>
                    {provider === PaymentProvidersEnum.CoinbasePay && !isLedgerAccount && (
                        <CoinbasePayWebView destinationAddress={selectedAccountAddress} />
                    )}
                    {provider === PaymentProvidersEnum.Transak && (
                        <TransakPayWebView currentAmount={0} destinationAddress={selectedAccountAddress} />
                    )}
                    {provider === PaymentProvidersEnum.Coinify && (
                        <CoinifyPayWebView currentAmount={0} destinationAddress={selectedAccountAddress} target="buy" />
                    )}
                </>
            }
        />
    )
}
