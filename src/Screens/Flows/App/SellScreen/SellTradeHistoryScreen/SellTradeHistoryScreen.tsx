import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo } from "react"
import { Layout } from "~Components"
import { CoinifyPayWebView } from "~Components/Reusable/CoinifyPayWebView"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { RootStackParamListSell } from "~Navigation/Stacks/SellStack"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import { OffRampProvidersEnum } from "../constants"

type Props = NativeStackScreenProps<RootStackParamListSell, Routes.SELL_TRADE_HISTORY>
const isProd = process.env.NODE_ENV === "production"

const isAndroid = PlatformUtils.isAndroid()

export const SellTradeHistoryScreen: React.FC<Props> = ({ route }) => {
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const { LL } = useI18nContext()

    const { provider } = route.params || {}

    const ifTest = useMemo(() => (isProd ? "" : " (STAGING)"), [])

    if (!selectedAccountAddress) return null

    return (
        <Layout
            hasSafeArea={isAndroid}
            title={`${LL.BTN_SELL()}${ifTest}`}
            fixedBody={
                <>
                    {provider === OffRampProvidersEnum.Coinify && (
                        <CoinifyPayWebView
                            currentAmount={0}
                            destinationAddress={selectedAccountAddress}
                            target="trade-history"
                        />
                    )}
                </>
            }
        />
    )
}
