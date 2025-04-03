import { useQuery } from "@tanstack/react-query"
import React from "react"
import { FeatureFlags, getFeatureFlags } from "~Api/FeatureFlags"

const initialState: FeatureFlags = {
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
        showStellaPayBanner: false,
    },
}

const FeatureFlagsContex = React.createContext<FeatureFlags | undefined>(initialState)

export const featureFlagsQueryKey = ["Feature", "Flags"]

export const FeatureFlagsProvider = ({ children }: { children: React.ReactNode }) => {
    const { data } = useQuery({
        queryKey: featureFlagsQueryKey,
        queryFn: getFeatureFlags,
        staleTime: 0,
        enabled: true,
        placeholderData: initialState,
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
