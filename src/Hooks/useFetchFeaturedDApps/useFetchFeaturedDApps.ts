import { useQuery } from "@tanstack/react-query"
import { setFeaturedDApps, useAppDispatch } from "~Storage/Redux"
import { useEffect } from "react"
import { AppHubIndexUrl, DiscoveryDApp } from "~Constants"

export const useFetchFeaturedDApps = () => {
    const dispatch = useAppDispatch()
    const {
        data: featuredDapps,
        isLoading,
        isFetching,
    } = useQuery<DiscoveryDApp[]>({
        queryKey: ["fetchFeaturedDApps"],
        queryFn: async () => {
            const response = await fetch(AppHubIndexUrl)
            const data = await response.json()
            return data
        },
    })

    useEffect(() => {
        const veWorldDapps = featuredDapps?.filter(dapp => dapp.isVeWorldSupported)
        dispatch(setFeaturedDApps(veWorldDapps ?? []))
    }, [dispatch, featuredDapps])

    return { isLoading, isFetching }
}
