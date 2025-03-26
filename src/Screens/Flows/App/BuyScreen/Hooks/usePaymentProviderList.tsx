import React, { useMemo } from "react"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"
import { PaymentMethodsIds } from "./constants"
import { CoinbaseLogoSmallSvg, CoinifyLogo } from "~Assets"
import { TransakLogoSmallSvg } from "~Assets/Img/TransakLogoSmallSvg"
import { useFeatureFlags } from "~Components"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { Image, ImageStyle, StyleSheet } from "react-native"

export enum PaymentProvidersEnum {
    CoinbasePay = "coinbase-pay",
    Transak = "transak",
    Coinify = "coinify",
}
export type PaymentProvider = {
    id: PaymentProvidersEnum
    name: string
    description: string
    img: React.ReactNode
    paymentMethods: PaymentMethodsIds[]
    fees: string
}

export const usePaymentProviderList = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { paymentProvidersFeature } = useFeatureFlags()

    const providers = useMemo(() => {
        const availableProviders: PaymentProvider[] = [
            {
                id: PaymentProvidersEnum.Transak,
                name: "Transak",
                description: LL.BD_BUY_DESCRIPTION_TRANSAK(),
                img: (
                    <TransakLogoSmallSvg
                        fill={theme.isDark ? COLORS.COINBASE_BACKGROUND_DARK : COLORS.COINBASE_BACKGROUND_BLUE}
                        width={32}
                    />
                ),
                paymentMethods: [isIOS() ? PaymentMethodsIds.ApplePay : PaymentMethodsIds.GoolePay],
                fees: "1.0%",
            },
            {
                id: PaymentProvidersEnum.CoinbasePay,
                name: "Coinbase",
                description: LL.BD_BUY_DESCRIPTION_COINBASE(),
                img: (
                    <CoinbaseLogoSmallSvg
                        fill={theme.isDark ? COLORS.COINBASE_BACKGROUND_DARK : COLORS.COINBASE_BACKGROUND_BLUE}
                        width={32}
                    />
                ),
                paymentMethods: [PaymentMethodsIds.CreditCard, PaymentMethodsIds.BankAccount],
                fees: "0.5 - 2.85%",
            },
            {
                id: PaymentProvidersEnum.Coinify,
                name: "Coinify",
                description: LL.BD_BUY_DESCRIPTION_COINBASE(),
                img: <Image source={CoinifyLogo} style={[styles.coinifyImg as ImageStyle]} />,
                paymentMethods: [PaymentMethodsIds.CreditCard, PaymentMethodsIds.BankAccount],
                fees: "1.0 - 5.0%",
            },
        ]

        return availableProviders.filter(provider => {
            const featureFlagProvider = paymentProvidersFeature[provider.id]
            return isIOS() ? featureFlagProvider.iOS : featureFlagProvider.android
        })
    }, [LL, paymentProvidersFeature, styles.coinifyImg, theme.isDark])

    return providers
}

const baseStyles = () =>
    StyleSheet.create({
        coinifyImg: {
            width: 32,
            height: 32,
        },
    })
