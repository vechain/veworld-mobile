import { useQuery } from "@tanstack/react-query"
import moment from "moment"
import { useCallback, useMemo } from "react"
import { useVeBetterDaoActiveDapps } from "~Hooks/useFetchFeaturedDApps"
import { VeBetterDaoDapp } from "~Model"
import { BigNutils } from "~Utils"

const secondsToMsTimestamp = (timestamp: string) => BigNutils(timestamp).multiply(1000).toNumber
const sortByTimestamp = (a: VeBetterDaoDapp, b: VeBetterDaoDapp) =>
    secondsToMsTimestamp(b.createdAtTimestamp) - secondsToMsTimestamp(a.createdAtTimestamp)

export const useNewDAppsV2 = () => {
    const { data: veBetterDaoDapps, isLoading: vbdLoading } = useVeBetterDaoActiveDapps()

    const getNewDapps = useCallback(() => {
        const threeMonthsAgo = moment().subtract(3, "months")

        const vbdEligibleApps =
            veBetterDaoDapps
                ?.filter(vbdDapp => moment(secondsToMsTimestamp(vbdDapp.createdAtTimestamp)).isAfter(threeMonthsAgo))
                .sort(sortByTimestamp) || []

        if (vbdEligibleApps.length === 0) {
            return [...(veBetterDaoDapps || [])]
                .sort(sortByTimestamp)
                .slice(0, 10)
                .sort(() => (Math.random() < 0.5 ? 1 : -1))
        }

        return vbdEligibleApps.slice(0, 10).sort(() => (Math.random() < 0.5 ? 1 : -1))
    }, [veBetterDaoDapps])

    const { data: newDapps, isLoading: dappsLoading } = useQuery({
        queryKey: ["DAPPS_CAROUSEL", "NEW"],
        queryFn: getNewDapps,
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        enabled: !!veBetterDaoDapps?.length,
    })

    const isLoading = useMemo(() => vbdLoading || dappsLoading, [dappsLoading, vbdLoading])

    return { isLoading, newDapps: newDapps ?? [] }
}
