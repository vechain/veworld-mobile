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
        "coinbase-pay": {
            android: boolean
            iOS: boolean
        }
        transak: {
            android: boolean
            iOS: boolean
        }
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
