import React, { useCallback, useEffect, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
    const queryClient = useQueryClient()

    const featureFlags = useMemo(() => queryClient.getQueryData<FeatureFlags>(queryKey) || initialState, [queryClient])

    const retreiveFeatureFlags = useCallback(async () => {
        const response = await getFeatureFlags()
        queryClient.setQueryData(queryKey, response, { updatedAt: new Date().getTime() })
    }, [queryClient])

    useEffect(() => {
        retreiveFeatureFlags()
    }, [retreiveFeatureFlags])

    return <FeatureFlagsContex.Provider value={featureFlags}>{children}</FeatureFlagsContex.Provider>
}

export const useFeatureFlags = () => {
    const context = React.useContext(FeatureFlagsContex)
    if (!context) {
        throw new Error("useFeatureFlags Context must be used within a FeatureFlagsProvider")
    }

    return context
}
