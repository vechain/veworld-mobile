// import axios from "axios"
// import { DriverNoVendor, SimpleNet } from "@vechain/connex-driver"
// import { newThor } from "@vechain/connex-framework/dist/thor"
// import { v4 as uuid } from "uuid"
// import {
//     AppThunk,
//     getAllNetworks,
//     getCurrentAccount,
//     getNetworkById,
// } from "~Storage/Caches"
// import { ThorConstants, debug, error, veWorldErrors, warn } from "~Common"
// import { Network, Settings } from "~Model"
// import SettingService from "../SettingService"

// /**
//  * Adds a new network and switches to that network.
//  * @param url
//  * @param name
//  */
// export const addCustomNode =
//     (url: string, name: string): AppThunk<Promise<void>> =>
//     async dispatch => {
//         debug("Attempting to add a custom network")

//         try {
//             //Test the Websocket connection for the user's URL - throws an error if it fails
//             await verifyWebSocketConnection(url)

//             //Get the genesis block
//             const block = await axios.get<Connex.Thor.Block>(`${url}/blocks/0`)

//             //Check if this is a network that we know
//             const type = ThorConstants.genesises.which(block.data.id)

//             const newNetworkId = uuid()

//             const customNodeUpdate = (settings: Settings) => {
//                 if (settings.network.networks.some(net => net.url === url)) {
//                     throw veWorldErrors.rpc.invalidRequest({
//                         message: "network_already_exists",
//                     })
//                 }

//                 //Remove trailing slash if it exists
//                 url = url.endsWith("/") ? url.slice(0, -1) : url

//                 settings.network.networks.push({
//                     id: newNetworkId,
//                     defaultNet: false,
//                     name: name,
//                     type: type,
//                     url: url,
//                     genesis: block.data,
//                 })
//             }

//             await dispatch(SettingService.update(customNodeUpdate))
//             await dispatch(change(newNetworkId))
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to add custom network",
//             })
//         }
//     }

// export const removeCustomNetwork =
//     (id: string): AppThunk<Promise<void>> =>
//     async dispatch => {
//         debug("Removing a custom network")

//         try {
//             const updateNetwork = (settings: Settings) => {
//                 const networkIndex = settings.network.networks.findIndex(
//                     net => net.id === id && !net.defaultNet,
//                 )

//                 if (networkIndex < 0) return warn("Network does not exist")

//                 settings.network.networks.splice(networkIndex, 1)
//             }

//             await dispatch(SettingService.update(updateNetwork))
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to update network",
//             })
//         }
//     }
// export const updateCustom =
//     (id: string, name: string, url: string): AppThunk<Promise<void>> =>
//     async dispatch => {
//         debug("Updating a custom network")

//         try {
//             //Test the Websocket connection for the user's URL - throws an error if it fails
//             await verifyWebSocketConnection(url)

//             const updateNetwork = (settings: Settings) => {
//                 const network = settings.network.networks.find(
//                     net => net.id === id && !net.defaultNet,
//                 )

//                 if (!network)
//                     throw veWorldErrors.rpc.resourceNotFound({
//                         message: "No network found for: " + name,
//                     })

//                 if (network.defaultNet)
//                     throw veWorldErrors.rpc.invalidRequest({
//                         message: "Can't delete a default network",
//                     })

//                 const index = settings.network.networks.indexOf(network)

//                 settings.network.networks[index].name = name
//                 settings.network.networks[index].url = url
//             }

//             await dispatch(SettingService.update(updateNetwork))
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to update network",
//             })
//         }
//     }

// let currentDriver: DriverNoVendor | undefined

// export const changeToNetworkOnGenesisId =
//     (genesisId: string): AppThunk<Promise<string>> =>
//     async (dispatch, getState) => {
//         debug("Changing to network by genesis id")

//         const networkForGenesisId = getAllNetworks(getState()).find(
//             net => net.genesis.id === genesisId,
//         )

//         if (!networkForGenesisId)
//             throw veWorldErrors.rpc.resourceNotFound({
//                 message: `Could not find network for genesisId ${genesisId}`,
//             })

//         await dispatch(change(networkForGenesisId.id))
//         return networkForGenesisId.name
//     }

// export const change =
//     (id: string): AppThunk<Promise<void>> =>
//     async (dispatch, getState) => {
//         debug("Changing to network")

//         try {
//             const currentAccount = getCurrentAccount(getState())
//             if (!currentAccount) throw Error("No account selected")

//             const network = getNetworkById(id)(getState())

//             if (!network)
//                 throw veWorldErrors.rpc.resourceNotFound({
//                     message: "No network found for ID: " + id,
//                 })

//             //Test the Websocket connection for the Node's URL - throw an error if it fails
//             await verifyWebSocketConnection(network.url)

//             const changeNetworkUpdate = async (settings: Settings) => {
//                 settings.network.currentNetwork = network

//                 currentDriver = new DriverNoVendor(
//                     new SimpleNet(network.url),
//                     network.genesis,
//                 )
//             }

//             await dispatch(SettingService.update(changeNetworkUpdate))
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to change network",
//             })
//         }
//     }

// export const getConnexThor = async (network: Network): Promise<Connex.Thor> => {
//     debug("Getting connex thor instance")
//     if (!currentDriver)
//         currentDriver = new DriverNoVendor(
//             new SimpleNet(network.url),
//             network.genesis,
//         )

//     return newThor(currentDriver)
// }

// export const toggleShowTestNetTag =
//     (): AppThunk<Promise<void>> => async dispatch => {
//         debug("Toggle show testnet tag")

//         const customNodeUpdate = (settings: Settings) =>
//             (settings.network.showTestNetTag = !settings.network.showTestNetTag)

//         await dispatch(SettingService.update(customNodeUpdate))
//     }

// export const toggleShowConversions =
//     (): AppThunk<Promise<void>> => async dispatch => {
//         debug("Toggle show conversions")

//         const customNodeUpdate = (settings: Settings) =>
//             (settings.network.showConversionOtherNets =
//                 !settings.network.showConversionOtherNets)

//         await dispatch(SettingService.update(customNodeUpdate))
//     }

// /**
//  * Verify a websocket connection for a given URL.
//  *
//  * Some nodes allow regular connections but block websockets due to Cors config.
//  * This will ensure the node we are adding/ switching to will not impact the app negatively
//  *
//  * The websocket is always closed on success or failure
//  *
//  * @param url - the url to verify
//  * @param timeout - the amount of time to wait
//  *
//  * @throws a {@link VeWorldError} if the connection fails (defaults to 5 seconds)
//  */
// const verifyWebSocketConnection = async (url: string, timeout = 5000) => {
//     debug("Verifying websocket connection")

//     try {
//         await new Promise<void>(function (onSuccess, onFailure) {
//             setTimeout(
//                 () =>
//                     onFailure(
//                         veWorldErrors.provider.disconnected({
//                             message: "Node timed out",
//                         }),
//                     ),
//                 timeout,
//             )
//             const wsUrl =
//                 url.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:") +
//                 "/subscriptions/beat2"

//             const webSocket = new WebSocket(wsUrl)

//             webSocket.onopen = () => {
//                 onSuccess()
//                 webSocket.close()
//             }

//             webSocket.onerror = e => {
//                 error(e)
//                 onFailure(
//                     veWorldErrors.provider.disconnected({
//                         message: "Failed to test WS connection",
//                     }),
//                 )
//                 webSocket.close()
//             }

//             webSocket.onclose = () => warn("Websocket closed")
//         })
//     } catch (e) {
//         error(e)
//         throw veWorldErrors.rpc.internal({
//             error: e,
//             message: "Failed to test WS connection",
//         })
//     }
// }
