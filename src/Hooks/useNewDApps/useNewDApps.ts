import { useMemo } from "react"
import { useVeBetterDaoDapps } from "../useFetchFeaturedDApps/useVeBetterDaoDapps"
import { useAppSelector, selectFeaturedDapps } from "~Storage/Redux"
import moment from "moment"

export const useNewDApps = () => {
    const dapps = useAppSelector(selectFeaturedDapps)
    const { data: veBetterDaoDapps, isLoading } = useVeBetterDaoDapps()

    const newDapps = useMemo(() => {
        const threeMonthsAgo = moment().subtract(3, "months")

        // Sort from newest to oldest
        const filteredDapps = dapps
            .filter(dapp =>
                veBetterDaoDapps?.find(
                    vbdDapp =>
                        dapp.veBetterDaoId === vbdDapp.id &&
                        moment(dapp.createAt).isAfter(threeMonthsAgo) &&
                        vbdDapp.appAvailableForAllocationVoting, // Filter out dapps that aren't endorsed
                ),
            )
            .sort((a, b) => b.createAt - a.createAt)

        // If there are no new dapps, return the 10 newest dapps
        if (filteredDapps.length === 0) {
            return dapps
                .filter(dapp => veBetterDaoDapps?.find(vbdDapp => vbdDapp.id === dapp.veBetterDaoId))
                .sort((a, b) => b.createAt - a.createAt)
                .slice(0, 10)
        }

        return filteredDapps.slice(0, 15)
    }, [dapps, veBetterDaoDapps])

    return { isLoading, newDapps: newDapps ?? [] }
}
