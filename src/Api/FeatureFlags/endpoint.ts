import { PaymentProvidersEnum } from "~Screens/Flows/App/BuyScreen/Hooks"

export type FeatureFlags = {
    marketsProxyFeature: {
        enabled: boolean
        url: string
        fallbackUrl: string
    }
    pushNotificationFeature: {
        enabled: boolean
    }
    subdomainClaimFeature: {
        enabled: boolean
    }
    paymentProvidersFeature: {
        [PaymentProvidersEnum.CoinbasePay]: {
            android: boolean
            iOS: boolean
        }
        [PaymentProvidersEnum.Transak]: {
            android: boolean
            iOS: boolean
        }
        [PaymentProvidersEnum.Coinify]: {
            android: boolean
            iOS: boolean
        }
    }
    discoveryFeature: {
        showStellaPayBanner: boolean
    }
}

export const getFeatureFlags = async () => {
    const featureFlagsUrl = __DEV__
        ? "https://vechain.github.io/veworld-feature-flags/dev/mobile-feature-flags.json"
        : "https://vechain.github.io/veworld-feature-flags/mobile-feature-flags.json"

    const req = await fetch(featureFlagsUrl, {
        method: "GET",
        headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
        },
    })

    const response: FeatureFlags = await req.json()
    return response
}
