import { useMemo } from "react"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { useAppSelector, selectFeaturedDapps } from "~Storage/Redux"
import moment from "moment"
import { BigNutils } from "~Utils"
import { VeBetterDaoDapp } from "~Model"

const secondsToMsTimestamp = (timestamp: string) => BigNutils(timestamp).multiply(1000).toNumber
const sortByTimestamp = (a: { vbd: VeBetterDaoDapp | undefined }, b: { vbd: VeBetterDaoDapp | undefined }) =>
    secondsToMsTimestamp(b.vbd!.createdAtTimestamp) - secondsToMsTimestamp(a.vbd!.createdAtTimestamp)

export const useNewDApps = () => {
    const dapps = useAppSelector(selectFeaturedDapps)
    const { data: veBetterDaoDapps, isLoading } = useVeBetterDaoDapps()

    const newDapps = useMemo(() => {
        const threeMonthsAgo = moment().subtract(3, "months")

        // Sort from newest to oldest
        const filteredDapps = dapps
            .map(dapp => {
                const foundDapp = veBetterDaoDapps?.find(
                    vbdDapp =>
                        dapp.veBetterDaoId === vbdDapp.id &&
                        moment(secondsToMsTimestamp(vbdDapp.createdAtTimestamp)).isAfter(threeMonthsAgo) &&
                        vbdDapp.appAvailableForAllocationVoting, // Filter out dapps that aren't endorsed
                )
                return { dapp, vbd: foundDapp }
            })
            .filter(({ vbd }) => Boolean(vbd))
            .sort(sortByTimestamp)
            .map(({ dapp }) => dapp)

        // If there are no new dapps, return the 10 newest dapps
        if (filteredDapps.length === 0) {
            return dapps
                .map(dapp => ({ dapp, vbd: veBetterDaoDapps?.find(vbdDapp => vbdDapp.id === dapp.veBetterDaoId) }))
                .filter(({ vbd }) => Boolean(vbd))
                .sort(sortByTimestamp)
                .map(({ dapp }) => dapp)
                .slice(0, 10)
        }

        return filteredDapps.slice(0, 15)
    }, [dapps, veBetterDaoDapps])

    return { isLoading, newDapps: newDapps ?? [] }
}
