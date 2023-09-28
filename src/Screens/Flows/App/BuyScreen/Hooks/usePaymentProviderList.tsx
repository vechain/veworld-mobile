import React from "react"
import CoinbaseLogoSvg from "~Assets/Img/CoinbaseLogoSvg"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { StyleSheet } from "react-native"

export type PaymentProvider = {
    id: string
    description: string
    buttonText: string
    img: any
}

export const usePaymentProviderList = () => {
    const { LL } = useI18nContext()
    const { theme } = useThemedStyles(baseStyles)
    return [
        {
            id: "coinbase-pay",
            description:
                "Buy you VechainThor tokens with Coinbase and receive them directly in your wallet. Coinbase is a secure online platform for buying, selling, transferring, and storing cryptocurrency.",
            buttonText: LL.BTN_BUY_COINBASE(),
            img: (
                <CoinbaseLogoSvg
                    width={"60%"}
                    fill={theme.isDark ? theme.colors.text : undefined}
                />
            ),
        },
    ]
}

const baseStyles = () => StyleSheet.create({})
