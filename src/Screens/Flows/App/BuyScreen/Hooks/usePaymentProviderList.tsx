import React, { useMemo } from "react"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"
import { PaymentMethod, PaymentMethodsIds, PaymentMethodsList } from "./constants"
import { CoinbaseLogoSmallSvg } from "~Assets"
import { TransakLogoSmallSvg } from "~Assets/Img/TransakLogoSmallSvg"
import { useFeatureFlags } from "~Components"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

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
    const { paymentProvidersFeature } = useFeatureFlags()

    const providers = useMemo(() => {
        const availableProviders = [
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
            {
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
            },
        ]

        return availableProviders.filter(provider => {
            const featureFlagProvider = paymentProvidersFeature[provider.id]
            return isIOS() ? featureFlagProvider.iOS : featureFlagProvider.android
        })
    }, [LL, paymentProvidersFeature, theme.isDark])

    return providers
}
