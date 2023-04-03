import { AppThunk } from "../Types"

import { addCustomNetwork, changeSelectedNetwork } from "../Slices/Network"
import { ConnectionUtils, debug, URLUtils, veWorldErrors } from "~Common"
import { genesises } from "~Common/Constant/Thor/ThorConstants"
import axios from "axios"
import { selectNetworks } from "../Selectors"
import { Network } from "~Model"
import { randomUUID } from "react-native-quick-crypto/lib/typescript/random"

export * from "../Slices/Network"

export const validateAndAddCustomNode = ({
    url,
    name,
}: {
    url: string
    name: string
}): AppThunk<Promise<void>> => {
    return async (dispatch, getState) => {
        debug("Attempting to add a custom network")

        if (!URLUtils.isAllowed(url))
            throw veWorldErrors.rpc.invalidParams({
                message: "URL must be secure (https or localhost)",
            })

        try {
            //Clean the URL
            url = URLUtils.clean(url)

            //Test the Websocket connection for the user's URL - throws an error if it fails
            await ConnectionUtils.verifyWebSocketConnection(url)

            //Get the genesis block
            const block = await axios.get<Connex.Thor.Block>(`${url}/blocks/0`)

            //Check if this is a network that we know
            const type = genesises.which(block.data.id)

            const networks = selectNetworks(getState())

            //Check if the network already exists
            networks.forEach(net => {
                if (net.urls.some(u => URLUtils.compareURLs(u, url)))
                    throw veWorldErrors.rpc.invalidRequest({
                        message: "Network already exists",
                    })
            })
            const id = randomUUID()
            const network: Network = {
                defaultNet: false,
                id,
                name,
                type: type,
                currentUrl: url,
                urls: [url],
                genesis: block.data,
            }
            dispatch(addCustomNetwork(network))
            dispatch(changeSelectedNetwork(network))
        } catch (e) {
            throw veWorldErrors.rpc.internal({
                message: "Failed to add custom network",
                error: e,
            })
        }
    }
}
