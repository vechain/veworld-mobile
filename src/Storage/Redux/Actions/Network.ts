import { AppThunk, createAppAsyncThunk } from "../Types"

import {
    addCustomNetwork,
    changeSelectedNetwork,
    removeCustomNetwork,
    updateCustomNetwork,
} from "../Slices/Network"
import { debug, veWorldErrors } from "~Common"
import { ConnectionUtils, URLUtils } from "~Utils"
import { genesises } from "~Common/Constant/Thor/ThorConstants"
import axios from "axios"
import {
    selectCustomNetworks,
    selectDefaultNetworks,
    selectSelectedNetwork,
} from "../Selectors"
import { Network } from "~Model"
import uuid from "react-native-uuid"

export * from "../Slices/Network"

const validateCustomNode = async ({
    url,
    name,
}: {
    url: string
    name: string
}) => {
    if (!URLUtils.isAllowed(url))
        throw veWorldErrors.rpc.invalidParams({
            message: "URL must be secure (https or localhost)",
        })
    try {
        //Clean the URL
        url = URLUtils.clean(url)

        //Test the Websocket connection for the user's URL - throws an error if it fails
        await ConnectionUtils.verifyWebSocketConnection(url)

        debug("Websocket connection verified")

        //Get the genesis block
        const blockResponse = await axios.get<Connex.Thor.Block>(
            `${url}/blocks/0`,
        )
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
    async (
        { url, name }: { url: string; name: string },
        { dispatch, getState, rejectWithValue },
    ) => {
        debug("Attempting to add a custom network")

        try {
            const network = await validateCustomNode({ url, name })

            const customNetworks = selectCustomNetworks(getState())

            //Check if the custom network already exists
            customNetworks.forEach(net => {
                if (net.urls.some(u => URLUtils.compareURLs(u, url)))
                    throw veWorldErrors.rpc.invalidRequest({
                        message: "Network already exists",
                    })
            })

            dispatch(addCustomNetwork(network))
            dispatch(changeSelectedNetwork(network))
        } catch (e) {
            return rejectWithValue(
                veWorldErrors.rpc.internal({
                    message: "Failed to add custom network",
                    error: e,
                }).message,
            )
        }
    },
)

export const validateAndUpdateCustomNode = createAppAsyncThunk(
    "network/validateAndUpdateCustomNode",
    async (
        {
            networkToUpdateId,
            url,
            name,
        }: { networkToUpdateId: string; url: string; name: string },
        { dispatch, getState, rejectWithValue },
    ) => {
        debug("Attempting to update a custom network")

        try {
            const network = await validateCustomNode({ url, name })

            const customNetworks = selectCustomNetworks(getState())

            //Check if the custom network already exists and is not the one being updated
            customNetworks.forEach(net => {
                if (net.id !== networkToUpdateId)
                    if (net.urls.some(u => URLUtils.compareURLs(u, url)))
                        throw veWorldErrors.rpc.invalidRequest({
                            message: "Network already exists",
                        })
            })

            dispatch(
                updateCustomNetwork({
                    id: networkToUpdateId,
                    updatedNetwork: network,
                }),
            )
        } catch (e) {
            return rejectWithValue(
                veWorldErrors.rpc.internal({
                    message: "Failed to add update network",
                    error: e,
                }).message,
            )
        }
    },
)

export const handleRemoveCustomNode =
    (id: string): AppThunk<void> =>
    (dispatch, getState) => {
        const customNetworks = selectCustomNetworks(getState())
        const selectedNetwork = selectSelectedNetwork(getState())
        const customNodeExists = customNetworks.some(net => net.id === id)

        if (!customNodeExists)
            throw veWorldErrors.rpc.invalidRequest({
                message: "Network does not exist",
            })

        //if the selected network is the one being removed, change the selected network to the default network
        if (selectedNetwork.id === id) {
            const defaultNetworks = selectDefaultNetworks(getState())
            //find the default network that matches the type of the network being removed
            const defaultNetwork =
                defaultNetworks.find(
                    net => net.type === selectedNetwork.type,
                ) || defaultNetworks[0]

            if (defaultNetwork) {
                dispatch(changeSelectedNetwork(defaultNetwork))
            }
        }

        dispatch(removeCustomNetwork({ id }))
    }
