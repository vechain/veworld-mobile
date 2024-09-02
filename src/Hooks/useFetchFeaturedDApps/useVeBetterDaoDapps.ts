import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useThor } from "~Components"
import { VEBETTER_DAO_DAPPS_MAIN_ADDRESS, VEBETTER_DAO_DAPPS_TEST_ADDRESS } from "~Constants"
import { NETWORK_TYPE } from "~Model"
import { getVeBetterDaoDapps } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useVeBetterDaoDapps = () => {
    const thor = useThor()
    const queryClient = useQueryClient()
    const { type } = useAppSelector(selectSelectedNetwork)
    const address = type === NETWORK_TYPE.MAIN ? VEBETTER_DAO_DAPPS_MAIN_ADDRESS : VEBETTER_DAO_DAPPS_TEST_ADDRESS

    useEffect(() => {
        if (type) {
            queryClient.invalidateQueries({ queryKey: ["VeBetterDao"] })
        }
    }, [queryClient, address, type])

    return useQuery({
        queryKey: ["VeBetterDao", type],
        queryFn: () => getVeBetterDaoDapps(thor, address),
        enabled: !!thor && !!type,
        placeholderData: [],
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
    })
}
