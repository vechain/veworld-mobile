import moment from "moment"
import { useMemo } from "react"
import { useVeBetterDaoActiveDapps } from "~Hooks/useFetchFeaturedDApps"
import { VeBetterDaoDapp } from "~Model"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

const secondsToMsTimestamp = (timestamp: string) => BigNutils(timestamp).multiply(1000).toNumber
const sortByTimestamp = (a: { vbd: VeBetterDaoDapp | undefined }, b: { vbd: VeBetterDaoDapp | undefined }) =>
    secondsToMsTimestamp(b.vbd!.createdAtTimestamp) - secondsToMsTimestamp(a.vbd!.createdAtTimestamp)

export const useNewDApps = () => {
    const dapps = useAppSelector(selectFeaturedDapps)
    const { data: veBetterDaoDapps, isLoading } = useVeBetterDaoActiveDapps()

    const newDapps = useMemo(() => {
        const threeMonthsAgo = moment().subtract(3, "months")

        // Sort from newest to oldest
        const filteredDapps = dapps
            .map(dapp => {
                const foundDapp = veBetterDaoDapps?.find(
                    vbdDapp =>
                        dapp.veBetterDaoId === vbdDapp.id &&
                        moment(secondsToMsTimestamp(vbdDapp.createdAtTimestamp)).isAfter(threeMonthsAgo),
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
