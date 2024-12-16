import axios from "axios"
import { VEBETTER_DAO_DAPPS_AXIOS_TIMEOUT } from "~Constants"
import { VeBetterDaoDAppMetadata } from "~Model"
import { URIUtils } from "~Utils"

export const getVeBetterDaoDAppMetadata = async (metadataURI: string): Promise<VeBetterDaoDAppMetadata> => {
    const url = URIUtils.convertUriToUrl(metadataURI)

    const metadata = await axios.get<VeBetterDaoDAppMetadata>(url, {
        timeout: VEBETTER_DAO_DAPPS_AXIOS_TIMEOUT,
        headers: url.includes("vechain.org/ipfs") ? { "x-project-id": "veworld-mobile" } : undefined,
    })
    return metadata.data
}
