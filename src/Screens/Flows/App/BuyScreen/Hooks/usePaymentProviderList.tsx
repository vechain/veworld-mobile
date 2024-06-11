import React from "react"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"
import { PaymentMethod, PaymentMethodsIds, PaymentMethodsList } from "./constants"
import { CoinbaseLogoSmallSvg } from "~Assets"

export enum PaymentProvidersEnum {
    CoinbasePay = "coinbase-pay",
    Transak = "transak",
}
export type PaymentProvider = {
    id: PaymentProvidersEnum
    name: string
    description: string
    img: React.ReactNode
    paymentMethods: PaymentMethod[]
}

export const usePaymentProviderList = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    return [
        {
            id: PaymentProvidersEnum.CoinbasePay,
            name: "Coinbase",
            description: LL.BD_BUY_DESCRIPTION_COINBASE(),
            img: (
                <CoinbaseLogoSmallSvg
                    fill={theme.isDark ? COLORS.COINBASE_BACKGROUND_DARK : COLORS.COINBASE_BACKGROUND_BLUE}
                    width={22}
                />
            ),
            paymentMethods: [
                PaymentMethodsList[PaymentMethodsIds.CreditCard],
                PaymentMethodsList[PaymentMethodsIds.BankAccount],
            ],
        },
    ]
}
