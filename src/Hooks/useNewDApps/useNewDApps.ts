import { useMemo } from "react"
import { useAppSelector, selectFeaturedDapps } from "~Storage/Redux"

export const useNewDApps = () => {
    const dapps = useAppSelector(selectFeaturedDapps)

    const reorderedDapps = useMemo(() => {
        const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds

        // Sort from newest to oldest
        return dapps.filter(dapp => dapp.createAt >= threeMonthsAgo).sort((a, b) => b.createAt - a.createAt)
    }, [dapps])

    return reorderedDapps.slice(0, 15)
}
