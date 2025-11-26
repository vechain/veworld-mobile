import { useQuery } from "@tanstack/react-query"
import React, { useCallback } from "react"
import DeviceInfo from "react-native-device-info"
import { FeatureFlags, getFeatureFlags } from "~Api/FeatureFlags"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { SemanticVersionUtils } from "~Utils"

export const initialState: FeatureFlags = {
    marketsProxyFeature: {
        enabled: true,
        url: "https://coin-api.veworld.vechain.org",
        fallbackUrl: "https://api.coingecko.com/api/v3",
    },
    pushNotificationFeature: {
        enabled: true,
    },
    subdomainClaimFeature: {
        enabled: true,
    },
    paymentProvidersFeature: {
        "coinbase-pay": {
            android: true,
            iOS: false,
            url: "https://onramp-proxy.vechain.org",
        },
        transak: {
            android: true,
            iOS: true,
        },
        coinify: {
            android: true,
            iOS: true,
        },
    },
    discoveryFeature: {
        bannersAutoplay: true,
        showStellaPayBanner: false,
        showStargateBanner: false,
    },
    forks: {
        GALACTICA: {
            transactions: {
                ledger: false,
            },
        },
        HAYABUSA: {
            stargate: {
                [defaultTestNetwork.genesis.id]: {
                    contract: "0x0000000000000000000000000000000000000000",
                },
                [defaultMainNetwork.genesis.id]: {
                    contract: "0x0000000000000000000000000000000000000000",
                },
            },
        },
    },
    smartWalletFeature: {
        enabled: false,
    },
    betterWorldFeature: {
        appsScreen: {
            enabled: true,
        },
        balanceScreen: {
            enabled: true,
            collectibles: {
                enabled: false,
            },
            tokens: {
                enabled: false,
            },
            send: {
                enabled: false,
            },
        },
    },
    notificationCenter: {
        registration: {
            enabled: false,
        },
    },
}

export const FeatureFlagsContext = React.createContext<FeatureFlags | undefined>(initialState)

export const featureFlagsQueryKey = ["Feature", "Flags"]

export const FeatureFlagsProvider = ({ children }: { children: React.ReactNode }) => {
    const currentVersion = DeviceInfo.getVersion()

    const isFeatureEnabled = useCallback(
        (value: string) => {
            if (SemanticVersionUtils.isVersion(value)) {
                return SemanticVersionUtils.moreThanOrEqual(currentVersion, value)
            }

            return value
        },
        [currentVersion],
    )

    const parseFeature = useCallback(
        (feature: string | object): string | object | boolean => {
            // If not an object, return as is
            if (typeof feature !== "object") {
                return isFeatureEnabled(feature)
            }

            // Recursively process all keys if no availability keys at this level
            const parsedEntries = Object.entries(feature).map(([key, value]) => {
                return [key, parseFeature(value)]
            })

            return Object.fromEntries(parsedEntries)
        },
        [isFeatureEnabled],
    )

    const parseFeatureFlags = useCallback(
        (data: unknown): FeatureFlags => {
            if (!data || typeof data !== "object") {
                return initialState
            }

            return parseFeature(data) as FeatureFlags
        },
        [parseFeature],
    )

    const { data } = useQuery({
        queryKey: featureFlagsQueryKey,
        queryFn: getFeatureFlags,
        staleTime: 0,
        enabled: true,
        select: parseFeatureFlags,
    })

    return <FeatureFlagsContext.Provider value={data ?? initialState}>{children}</FeatureFlagsContext.Provider>
}

export const useFeatureFlags = () => {
    const context = React.useContext(FeatureFlagsContext)
    if (!context) {
        throw new Error("useFeatureFlags Context must be used within a FeatureFlagsProvider")
    }

    return context
}
