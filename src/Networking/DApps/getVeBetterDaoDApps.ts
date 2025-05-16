import { abis } from "~Constants"
import { VeBetterDaoDapp } from "~Model"

export const getVeBetterDaoDapps = async (thor: Connex.Thor, address: string): Promise<VeBetterDaoDapp[]> => {
    const res = await thor.account(address).method(abis.VeBetterDao.X2EarnDapps).call()
    const apps = res?.decoded[0] ?? []

    return apps.map((app: any) => ({
        id: app[0],
        teamWalletAddress: app[1],
        name: app[2],
        metadataURI: app[3], // IPFS ipfs://dsasdadadasda
        createdAtTimestamp: app[4],
        appAvailableForAllocationVoting: app[5],
    }))
}
