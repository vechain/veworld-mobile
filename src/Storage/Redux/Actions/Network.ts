import { AppThunk, createAppAsyncThunk } from "../Types"

import {
    addCustomNetwork,
    changeSelectedNetwork,
    removeCustomNetwork,
    updateCustomNetwork,
    updateNodeError,
} from "../Slices/Network"
import { debug, ConnectionUtils, URIUtils, warn } from "~Utils"
import { ERROR_EVENTS, genesises } from "~Constants"
import axios from "axios"
import { selectCustomNetworks, selectDefaultNetworks, selectNetworkById, selectSelectedNetwork } from "../Selectors"
import { Network } from "~Model"
import uuid from "react-native-uuid"

export * from "../Slices/Network"

const validateCustomNode = async ({ url, name }: { url: string; name: string }) => {
    if (!URIUtils.isAllowed(url)) throw new Error("URL must be secure (https or localhost)")
    try {
        //Clean the URL
        url = URIUtils.clean(url)

        //Test the Websocket connection for the user's URL - throws an error if it fails
        await ConnectionUtils.verifyWebSocketConnection(url)

        debug(ERROR_EVENTS.SETTINGS, "Websocket connection verified")

        //Get the genesis block
        const blockResponse = await axios.get<Connex.Thor.Block>(`${url}/blocks/0`)
        const block = blockResponse.data

        //Check if this is a network that we know
        const type = genesises.which(block.id)

        const network: Network = {
            id: uuid.v4().toString(),
            defaultNet: false,
            name,
            type: type,
            currentUrl: url,
            urls: [url],
            genesis: block,
        }
        return network
    } catch (e) {
        throw new Error("Failed to add validate network")
    }
}

export const validateAndAddCustomNode = createAppAsyncThunk(
    "network/validateAndAddCustomNode",
    async ({ url, name }: { url: string; name: string }, { dispatch, getState, rejectWithValue }) => {
        debug(ERROR_EVENTS.SETTINGS, "Attempting to add a custom network")

        try {
            const network = await validateCustomNode({ url, name })

            const customNetworks = selectCustomNetworks(getState())

            //Check if the custom network already exists
            customNetworks.forEach(net => {
                if (net.urls.some(u => URIUtils.compareURLs(u, url))) throw new Error("Network already exists")
            })

            dispatch(addCustomNetwork(network))
            dispatch(changeSelectedNetwork(network))
        } catch (e) {
            return rejectWithValue("Failed to add custom network")
        }
    },
)

export const validateAndUpdateCustomNode = createAppAsyncThunk(
    "network/validateAndUpdateCustomNode",
    async (
        { networkToUpdateId, url, name }: { networkToUpdateId: string; url: string; name: string },
        { dispatch, getState, rejectWithValue },
    ) => {
        debug(ERROR_EVENTS.SETTINGS, "Attempting to update a custom network")

        try {
            const network = await validateCustomNode({ url, name })

            const customNetworks = selectCustomNetworks(getState())

            //Check if the custom network already exists and is not the one being updated
            customNetworks.forEach(net => {
                if (net.id !== networkToUpdateId)
                    if (net.urls.some(u => URIUtils.compareURLs(u, url))) throw new Error("Network already exists")
            })

            dispatch(
                updateCustomNetwork({
                    id: networkToUpdateId,
                    updatedNetwork: network,
                }),
            )
        } catch (e) {
            return rejectWithValue("Failed to add update network")
        }
    },
)

export const handleRemoveCustomNode =
    (id: string): AppThunk<void> =>
    (dispatch, getState) => {
        const customNetworks = selectCustomNetworks(getState())
        const selectedNetwork = selectSelectedNetwork(getState())
        const customNodeExists = customNetworks.some(net => net.id === id)

        if (!customNodeExists) throw new Error("Network does not exist")

        //if the selected network is the one being removed, change the selected network to the default network
        if (selectedNetwork.id === id) {
            const defaultNetworks = selectDefaultNetworks(getState())
            //find the default network that matches the type of the network being removed
            const defaultNetwork = defaultNetworks.find(net => net.type === selectedNetwork.type) || defaultNetworks[0]

            if (defaultNetwork) {
                dispatch(changeSelectedNetwork(defaultNetwork))
            }
        }

        dispatch(removeCustomNetwork({ id }))
    }

export const handleChangeNode = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    try {
        const currentNetworkId = getState().networks.selectedNetwork
        const network = selectNetworkById(getState(), currentNetworkId)

        if (!network) throw new Error("No network found for ID:" + currentNetworkId)

        let validUrl: string | undefined

        for (const url of network.urls) {
            try {
                await ConnectionUtils.verifyWebSocketConnection(url)
                validUrl = url
                warn(ERROR_EVENTS.SETTINGS, "Changing to URL" + url)
                break
            } catch (e) {
                warn("SETTINGS", "Failed to connect to " + url + e)
            }
        }

        if (validUrl) {
            const updatedNetwork = {
                ...network,
                currentUrl: validUrl,
            }
            dispatch(changeSelectedNetwork(updatedNetwork))
        } else {
            throw new Error("Failed to connect to any URL for the current network.")
        }
    } catch (e) {
        dispatch(updateNodeError(true))
    }
}
