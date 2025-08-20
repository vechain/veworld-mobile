import { useQuery } from "@tanstack/react-query"
import React, { useCallback } from "react"
import DeviceInfo from "react-native-device-info"
import { FeatureFlags, getFeatureFlags } from "~Api/FeatureFlags"
import { SemanticVersionUtils } from "~Utils"

const initialState: FeatureFlags = {
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
        },
        transak: {
            android: true,
            iOS: true,
        },
        coinify: {
            android: true,
            iOS: false,
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
    },
    betterWorldFeature: {
        appsScreen: {
            enabled: false,
        },
    },
}

const FeatureFlagsContex = React.createContext<FeatureFlags | undefined>(initialState)

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

    return <FeatureFlagsContex.Provider value={data ?? initialState}>{children}</FeatureFlagsContex.Provider>
}

export const useFeatureFlags = () => {
    const context = React.useContext(FeatureFlagsContex)
    if (!context) {
        throw new Error("useFeatureFlags Context must be used within a FeatureFlagsProvider")
    }

    return context
}
