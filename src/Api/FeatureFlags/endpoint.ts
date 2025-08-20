import { PaymentProvidersEnum } from "~Screens/Flows/App/BuyScreen/Hooks"

export type FeatureFlagResponse = {
    marketsProxyFeature: {
        enabled: string
        url: string
        fallbackUrl: string
    }
    pushNotificationFeature: {
        enabled: string
    }
    subdomainClaimFeature: {
        enabled: string
    }
    paymentProvidersFeature: {
        [PaymentProvidersEnum.CoinbasePay]: {
            android: string
            iOS: string
        }
        [PaymentProvidersEnum.Transak]: {
            android: string
            iOS: string
        }
        [PaymentProvidersEnum.Coinify]: {
            android: string
            iOS: string
        }
    }
    discoveryFeature: {
        bannersAutoplay: string
        showStellaPayBanner: string
        showStargateBanner: string
    }
    forks: {
        GALACTICA: {
            transactions: {
                ledger: string
            }
        }
    }
    betterWorldFeature: {
        appsScreen: {
            enabled: string
        }
    }
}

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
        bannersAutoplay: boolean
        showStellaPayBanner: boolean
        showStargateBanner: boolean
    }
    forks: {
        GALACTICA: {
            transactions: {
                ledger: boolean
            }
        }
    }
    betterWorldFeature: {
        appsScreen: {
            enabled: boolean
        }
    }
}

export const getFeatureFlags = async () => {
    const featureFlagsUrl = __DEV__
        ? "https://vechain.github.io/veworld-feature-flags/dev/mobile-versioned-feature-flags.json"
        : "https://vechain.github.io/veworld-feature-flags/mobile-versioned-feature-flags.json"

    const req = await fetch(featureFlagsUrl, {
        method: "GET",
        headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
        },
    })

    const response: FeatureFlagResponse = await req.json()
    return response
}
