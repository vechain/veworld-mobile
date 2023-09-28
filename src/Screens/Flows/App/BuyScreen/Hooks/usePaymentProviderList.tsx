import React from "react"
import CoinbaseLogoSmallSvg from "~Assets/Img/CoinbaseLogoSmallSvg"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { StyleSheet } from "react-native"

export type PaymentMethod = {
    id: string
    icon: string
}

export type PaymentProvider = {
    id: string
    name: string
    description: string
    buttonText: string
    img: React.ReactNode
    paymentMethods: PaymentMethod[]
}

export const usePaymentProviderList = () => {
    const { LL } = useI18nContext()
    const { theme } = useThemedStyles(baseStyles)
    return [
        {
            id: "coinbase-pay",
            name: "Coinbase",
            description:
                "Buy on Coinbase and receive the tokens directly in your wallet.",
            buttonText: LL.BTN_BUY_COINBASE(),
            img: (
                <CoinbaseLogoSmallSvg
                    fill={theme.isDark ? "#0a0b0d" : "#0052FF"}
                    width={22}
                />
            ),
            paymentMethods: [
                { id: "credit-card", icon: "credit-card-outline" },
                { id: "bank", icon: "bank-outline" },
            ],
        },
    ]
}

const baseStyles = () => StyleSheet.create({})
