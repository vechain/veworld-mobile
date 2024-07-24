import { abis, VEBETTER_DAO_DAPPS_MAIN_ADDRESS } from "~Constants"
import { VeBetterDaoDapp } from "~Model"

export const getVeBetterDaoDapps = async (thor: Connex.Thor): Promise<VeBetterDaoDapp[]> => {
    const res = await thor.account(VEBETTER_DAO_DAPPS_MAIN_ADDRESS).method(abis.VeBetterDao.X2EarnDapps).call()
    const apps = res.decoded[0]

    return apps.map((app: any) => ({
        id: app[0],
        teamWalletAddress: app[1],
        name: app[2],
        metadataURI: app[3], // IPFS ipfs://dsasdadadasda
        createdAtTimestamp: app[4],
        appAvailableForAllocationVoting: app[5],
    }))
}
