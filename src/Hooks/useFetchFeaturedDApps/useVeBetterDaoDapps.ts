import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import _ from "lodash"
import { VEBETTER_DAO_DAPPS_MAIN_ADDRESS } from "~Constants"
import { useMainnetThorClient } from "~Hooks/useThorClient"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { getVeBetterDaoDAppMetadata, getVeBetterDaoDapps } from "~Networking"

const getFullVBDDapps = async (thor: ThorClient) => {
    const dapps = await getVeBetterDaoDapps(thor, VEBETTER_DAO_DAPPS_MAIN_ADDRESS)
    const buckets = _.chunk(dapps, 10)
    const result: (VeBetterDaoDapp & VeBetterDaoDAppMetadata)[] = []
    for (const bucket of buckets) {
        const fullResults = await Promise.all(
            bucket.map(async dapp => {
                const md = await getVeBetterDaoDAppMetadata(`ipfs://${dapp.metadataURI}`)
                return { ...dapp, ...md }
            }),
        )
        result.push(...fullResults)
    }
    return result
}

export const useVeBetterDaoDapps = (enabled = true) => {
    const thor = useMainnetThorClient()

    return useQuery({
        queryKey: ["VeBetterDao"],
        queryFn: () => getFullVBDDapps(thor),
        enabled: !!thor && enabled,
        placeholderData: [],
        retry: 5,
        retryDelay: 2000,
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
    })
}
