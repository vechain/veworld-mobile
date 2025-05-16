import { useMemo } from "react"
import { useVeBetterDaoDapps } from "./useVeBetterDaoDapps"

export const useVeBetterDaoActiveDapps = (enabled = true) => {
    const { data: rawData, ...props } = useVeBetterDaoDapps(enabled)

    const data = useMemo(() => {
        if (!rawData) return rawData
        return rawData.filter(app => Boolean(app.appAvailableForAllocationVoting))
    }, [rawData])
    const memoized = useMemo(() => ({ ...props, data }), [data, props])

    return memoized
}
