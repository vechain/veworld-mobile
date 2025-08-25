import { queryClient } from "~Api/QueryProvider"
import { VEBETTER_DAO_DAPPS_AXIOS_TIMEOUT } from "~Constants"
import { VeBetterDaoDAppMetadata } from "~Model"
import IPFSUtils from "~Utils/IPFSUtils"

export const getVeBetterDaoDAppMetadata = async (metadataURI: string): Promise<VeBetterDaoDAppMetadata> =>
    queryClient.fetchQuery(
        IPFSUtils.getIpfsQueryKeyOptions<VeBetterDaoDAppMetadata>(metadataURI, {
            timeout: VEBETTER_DAO_DAPPS_AXIOS_TIMEOUT,
        }),
    )
