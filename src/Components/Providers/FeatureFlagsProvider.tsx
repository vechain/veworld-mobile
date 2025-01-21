import React from "react"
import { useQuery } from "@tanstack/react-query"
import { FeatureFlags, getFeatureFlags } from "~Api/FeatureFlags"

const initialState: FeatureFlags = {
    marketsProxyFeature: {
        enabled: true,
        url: "https://coin-api.veworld.vechain.org",
        fallbackUrl: "https://api.coingecko.com/api/v3",
    },
    subdomainClaimFeature: {
        enabled: true,
    },
}

const FeatureFlagsContex = React.createContext<FeatureFlags>(initialState)

export const featureFlagsQueryKey = ["Feature", "Flags"]

export const FeatureFlagsProvider = ({ children }: { children: React.ReactNode }) => {
    // This query will override the default queryClient settings just for feature flags
    const { data: featureFlags } = useQuery({
        queryKey: featureFlagsQueryKey,
        queryFn: getFeatureFlags,
        initialData: initialState,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchInterval: 1000 * 60 * 5, // 5 minutes
    })

    return <FeatureFlagsContex.Provider value={featureFlags}>{children}</FeatureFlagsContex.Provider>
}

export const useFeatureFlags = () => {
    const context = React.useContext(FeatureFlagsContex)
    if (!context) {
        throw new Error("useFeatureFlags Context must be used within a FeatureFlagsProvider")
    }

    return context
}
