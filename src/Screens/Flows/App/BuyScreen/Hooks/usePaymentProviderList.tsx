import React from "react"
import CoinbaseLogoSmallSvg from "~Assets/Img/CoinbaseLogoSmallSvg"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"

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
    const theme = useTheme()

    return [
        {
            id: "coinbase-pay",
            name: "Coinbase",
            description: LL.BD_BUY_DESCRIPTION_COINBASE(),
            buttonText: LL.BTN_BUY_COINBASE(),
            img: (
                <CoinbaseLogoSmallSvg
                    fill={
                        theme.isDark
                            ? COLORS.COINBASE_BACKGROUND_DARK
                            : COLORS.COINBASE_BACKGROUND_BLUE
                    }
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
