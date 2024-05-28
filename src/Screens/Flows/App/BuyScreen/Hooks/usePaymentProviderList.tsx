import React from "react"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { COLORS, FEATURE_COINBASE } from "~Constants"
import { PaymentMethod, PaymentMethodsIds, PaymentMethodsList } from "./constants"
import { CoinbaseLogoSmallSvg } from "~Assets"
import { TransakLogoSmallSvg } from "~Assets/Img/TransakLogoSmallSvg"

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

    const providers = []

    if (FEATURE_COINBASE) {
        providers.push({
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
        })
    }

    providers.push({
        id: PaymentProvidersEnum.Transak,
        name: "Transak",
        description: LL.BD_BUY_DESCRIPTION_TRANSAK(),
        img: (
            <TransakLogoSmallSvg
                fill={theme.isDark ? COLORS.COINBASE_BACKGROUND_DARK : COLORS.COINBASE_BACKGROUND_BLUE}
                width={22}
            />
        ),
        paymentMethods: [PaymentMethodsList[PaymentMethodsIds.CreditCard]],
    })
    return providers
}
