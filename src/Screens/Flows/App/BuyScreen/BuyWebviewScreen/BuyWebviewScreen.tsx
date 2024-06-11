import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo } from "react"
import { BackButtonHeader, BaseSpacer, CoinbasePayWebView, Layout } from "~Components"
import { RootStackParamListBuy, Routes } from "~Navigation"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import { PaymentProvidersEnum } from "../Hooks"

type Props = NativeStackScreenProps<RootStackParamListBuy, Routes.BUY_WEBVIEW>
const isProd = process.env.NODE_ENV === "production"

const isAndroid = PlatformUtils.isAndroid()

export const BuyWebviewScreen: React.FC<Props> = ({ route }) => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const { provider, providerName } = route.params || {}

    const ifTest = useMemo(() => (isProd ? "" : " (STAGING)"), [])

    if (!selectedAccountAddress) return null

    return (
        <Layout
            hasSafeArea={isAndroid}
            noBackButton
            noMargin
            fixedHeader={
                <>
                    <BaseSpacer height={8} />
                    <BackButtonHeader hasBottomSpacer={false} text={`${providerName}${ifTest}`} />
                    <BaseSpacer height={8} />
                </>
            }
            fixedBody={
                <>
                    {provider === PaymentProvidersEnum.CoinbasePay && (
                        <CoinbasePayWebView currentAmount={0} destinationAddress={selectedAccountAddress} />
                    )}
                </>
            }
        />
    )
}
