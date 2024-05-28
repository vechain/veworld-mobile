import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { BackButtonHeader, BaseSpacer, CoinbasePayWebView, Layout, TransakPayWebView } from "~Components"
import { RootStackParamListBuy, Routes } from "~Navigation"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import { PaymentProvidersEnum } from "../Hooks"

type Props = NativeStackScreenProps<RootStackParamListBuy, Routes.BUY_WEBVIEW>

export const BuyWebviewScreen: React.FC<Props> = ({ route }) => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const { provider } = route.params

    if (!selectedAccountAddress) return null

    return (
        <Layout
            hasSafeArea={!PlatformUtils.isIOS()}
            noBackButton
            noMargin
            fixedHeader={
                <>
                    <BaseSpacer height={8} />
                    <BackButtonHeader hasBottomSpacer={false} />
                    <BaseSpacer height={8} />
                </>
            }
            fixedBody={
                <>
                    {provider === PaymentProvidersEnum.CoinbasePay && (
                        <CoinbasePayWebView currentAmount={0} destinationAddress={selectedAccountAddress} />
                    )}
                    {provider === PaymentProvidersEnum.Transak && (
                        <TransakPayWebView currentAmount={0} destinationAddress={selectedAccountAddress} />
                    )}
                </>
            }
        />
    )
}
