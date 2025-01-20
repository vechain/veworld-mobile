import React from "react"
import { useQuery } from "@tanstack/react-query"
import { FeatureFlags, getFeatureFlags } from "~Api/FeatureFlags"

const initialState: FeatureFlags = {
    marketsProxyFeature: {
        enabled: true,
        url: "https://coin-api.veworld.vechain.org",
        fallbackUrl: "https://api.coingecko.com/api/v3",
    },
}

const FeatureFlagsContex = React.createContext<FeatureFlags>(initialState)

const queryKey = ["Feature", "Flags"]

export const FeatureFlagsProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: featureFlags } = useQuery({
        queryKey: queryKey,
        queryFn: getFeatureFlags,
        initialData: initialState,
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
