import { ThorClient } from "@vechain/sdk-network"
import { abis } from "~Constants"
import { VeBetterDaoDapp } from "~Model"

export const getVeBetterDaoDapps = async (thor: ThorClient, address: string): Promise<VeBetterDaoDapp[]> => {
    const res = await thor.contracts.load(address, [abis.VeBetterDao.X2EarnDapps]).read.apps()
    const apps = res[0]

    return apps.map(app => ({
        ...app,
        id: app.id as string,
        createdAtTimestamp: app.createdAtTimestamp.toString(),
    }))
}
