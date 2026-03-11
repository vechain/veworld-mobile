import { FeatureFlags } from "~Api/FeatureFlags/endpoint"

export const mockedFeatureFlags: FeatureFlags = {
    marketsProxyFeature: {
        enabled: true,
        url: "https://coin-api.veworld.vechain.org",
        fallbackUrl: "https://api.coingecko.com/api/v3",
    },
    pushNotificationFeature: {
        enabled: false,
    },
    subdomainClaimFeature: {
        enabled: true,
    },
    paymentProvidersFeature: {
        "coinbase-pay": {
            android: true,
            iOS: false,
            url: "",
        },
        transak: {
            android: true,
            iOS: true,
            url: "",
        },
        coinify: {
            android: true,
            iOS: false,
        },
    },
    discoveryFeature: {
        bannersAutoplay: true,
        showStellaPayBanner: false,
        showStargateBanner: true,
    },
    forks: {
        GALACTICA: {
            transactions: {
                ledger: false,
            },
        },
        HAYABUSA: {
            stargate: {},
        },
    },
    notificationCenter: {
        registration: {
            enabled: false,
        },
    },
    betterWorldFeature: {
        appsScreen: {
            enabled: false,
        },
        balanceScreen: {
            enabled: false,
            collectibles: { enabled: false },
            tokens: { enabled: false },
            send: { enabled: false },
            sendCollectibles: { enabled: false },
        },
        onboardingScreen: {
            enabled: false,
        },
    },
    smartWalletFeature: {
        enabled: false,
    },
    hiddenForYouPopularApps: [],
}
