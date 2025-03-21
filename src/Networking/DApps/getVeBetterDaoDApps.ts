import { abis } from "~Constants"
import { VeBetterDaoDapp } from "~Model"

export const getVeBetterDaoDapps = async (thor: Connex.Thor, address: string): Promise<VeBetterDaoDapp[]> => {
    const res = await thor.account(address).method(abis.VeBetterDao.X2EarnDapps).call()
    const apps = res?.decoded[0] ?? []

    //ID: 0x091860cf708ffb26aa0b9b761b8e56178722c51223b0eb943a67df7c8d33c8f9 is VeTrees

    return apps
        .filter(([id]: any[]) => id !== "0x091860cf708ffb26aa0b9b761b8e56178722c51223b0eb943a67df7c8d33c8f9")
        .map((app: any) => ({
            id: app[0],
            teamWalletAddress: app[1],
            name: app[2],
            metadataURI: app[3], // IPFS ipfs://dsasdadadasda
            createdAtTimestamp: app[4],
            appAvailableForAllocationVoting: app[5],
        }))
}
