import { useMemo } from "react"
import { useCurrentAllocationsRoundId, useRoundXApps, useXAppsShares } from "../VeBetterDao"
import { useAppSelector, selectFeaturedDapps } from "~Storage/Redux"
import { DiscoveryDApp } from "~Constants"

export const useTrendingDApps = () => {
    const dapps = useAppSelector(selectFeaturedDapps)

    const { data: roundId } = useCurrentAllocationsRoundId()

    const { data: xApps, isLoading: xAppsLoading } = useRoundXApps(roundId)

    const xAppsSharesQuery = useXAppsShares(xApps?.map(app => app.id) ?? [], roundId)

    const sortedData: DiscoveryDApp[] = useMemo(() => {
        if (!xAppsSharesQuery.data || !dapps) return []

        return xAppsSharesQuery.data
            .map(appShares => ({
                percentage: appShares.share + appShares.unallocatedShare,
                app: dapps.find(d => d.veBetterDaoId === appShares.app),
            }))
            .sort((a, b) => Number(b.percentage) - Number(a.percentage))
            .reduce((acc: DiscoveryDApp[], dapp) => {
                if (dapp.app) {
                    acc.push(dapp.app)
                }
                return acc
            }, [])
    }, [xAppsSharesQuery.data, dapps])

    const isLoading = xAppsLoading || xAppsSharesQuery.isLoading

    return {
        isLoading,
        trendingDapps: sortedData,
    }
}
