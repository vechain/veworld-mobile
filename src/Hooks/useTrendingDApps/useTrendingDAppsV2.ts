import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { useCurrentAllocationsRoundId, useRoundXApps, useXAppsShares } from "~Hooks/VeBetterDao"
import { useVeBetterDaoActiveDapps } from "~Hooks/useFetchFeaturedDApps"

export const useTrendingDAppsV2 = () => {
    const { data: vbdApps, isLoading: vbdAppsLoading } = useVeBetterDaoActiveDapps()
    const { data: roundId } = useCurrentAllocationsRoundId()
    const { hiddenForYouPopularApps } = useFeatureFlags()
    const { data: xApps, isLoading: xAppsLoading } = useRoundXApps(roundId)

    const { data: xAppSharesdData, isLoading: xAppsSharesLoading } = useXAppsShares(
        xApps?.map(app => app.id) ?? [],
        roundId,
    )

    const getSortedData = useCallback(() => {
        if (!xAppSharesdData || !vbdApps) return []

        return xAppSharesdData
            .map(appShares => ({
                percentage: appShares.share + appShares.unallocatedShare,
                app: vbdApps.find(d => d.id === appShares.app),
            }))
            .filter(({ app }) => app)
            .sort((a, b) => Number(b.percentage) - Number(a.percentage))
            .map(({ app }) => app!)
            .filter(app => !hiddenForYouPopularApps.includes(app.id))
            .slice(0, 10)
            .sort(() => (Math.random() < 0.5 ? 1 : -1))
    }, [xAppSharesdData, vbdApps, hiddenForYouPopularApps])

    const { data: sortedData, isLoading: sortedDataLoading } = useQuery({
        queryKey: ["DAPPS_CAROUSEL", "TRENDING"],
        queryFn: getSortedData,
        staleTime: 24 * 60 * 60 * 1000,
        enabled: !!vbdApps?.length && !!xAppSharesdData?.length,
    })

    const isLoading = useMemo(
        () => xAppsLoading || xAppsSharesLoading || vbdAppsLoading || sortedDataLoading,
        [sortedDataLoading, vbdAppsLoading, xAppsLoading, xAppsSharesLoading],
    )

    return {
        isLoading,
        trendingDapps: sortedData || [],
    }
}
