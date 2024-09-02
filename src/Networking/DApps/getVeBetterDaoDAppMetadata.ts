import axios from "axios"
import { VEBETTER_DAO_DAPPS_AXIOS_TIMEOUT } from "~Constants"
import { VeBetterDaoDAppMetadata } from "~Model"
import { URIUtils } from "~Utils"

export const getVeBetterDaoDAppMetadata = async (metadataURI: string): Promise<VeBetterDaoDAppMetadata> => {
    const metadata = await axios.get<VeBetterDaoDAppMetadata>(URIUtils.convertUriToUrl(metadataURI), {
        timeout: VEBETTER_DAO_DAPPS_AXIOS_TIMEOUT,
    })
    return metadata.data
}
