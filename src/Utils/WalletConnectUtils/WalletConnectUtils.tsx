import { Core } from "@walletconnect/core"
import {
    ICore,
    PendingRequestTypes,
    SessionTypes,
    SignClientTypes,
} from "@walletconnect/types"
import { IWeb3Wallet, Web3Wallet } from "@walletconnect/web3wallet"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { Network, NETWORK_TYPE } from "~Model"
import { error } from "~Utils/Logger"
import { NavigationState } from "@react-navigation/native"
import { Routes } from "~Navigation"
import {
    ErrorResponse,
    JsonRpcError,
} from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"
import HexUtils from "~Utils/HexUtils"

let web3wallet: IWeb3Wallet
export const core: ICore = new Core({
    projectId: __DEV__
        ? process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID_DEV
        : process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID_PROD,
})

export async function getWeb3Wallet() {
    if (web3wallet) {
        return web3wallet
    }

    web3wallet = await Web3Wallet.init({
        core,
        metadata: {
            name: "VeWorld Mobile Wallet",
            description: "Manage your VeChain assets with VeWorld",
            url: "https://walletconnect.com/",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
    })

    return web3wallet
}

export function getPairAttributes(
    proposal: SignClientTypes.EventArguments["session_proposal"],
) {
    const name = proposal.params.proposer.metadata.name
    const url = proposal.params.proposer.metadata.url
    const description = proposal.params.proposer.metadata.description
    const methods = proposal.params.requiredNamespaces.vechain.methods
    const events = proposal.params.requiredNamespaces.vechain.events
    const chains = proposal.params.requiredNamespaces.vechain.chains
    const icon = proposal.params.proposer.metadata.icons[0]

    const attributes = {
        name,
        url,
        methods,
        events,
        chains,
        icon,
        description,
    }
    return attributes
}

export function getRequestEventAttributes(
    requestEvent: PendingRequestTypes.Struct,
) {
    const chainId = requestEvent.params.chainId.toUpperCase()
    const method = requestEvent.params.request.method
    const params = requestEvent.params.request.params[0]
    const topic = requestEvent.topic

    const attributes = {
        chainId,
        method,
        params,
        topic,
    }
    return attributes
}

export function getSessionRequestAttributes(
    sessionRequest: SessionTypes.Struct,
) {
    const name = sessionRequest.peer.metadata.name
    const icon = sessionRequest.peer.metadata.icons[0]
    const url = sessionRequest.peer.metadata.url
    const description = sessionRequest.peer.metadata.description

    const attributes = {
        name,
        icon,
        url,
        description,
    }
    return attributes
}

export function isWalletConnectRoute(
    navState: NavigationState<ReactNavigation.RootParamList>,
) {
    if (!navState || !navState.routes) return false

    return navState.routes.some(
        route =>
            route.name === Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN ||
            route.name === Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN ||
            route.name === Routes.CONNECT_APP_SCREEN,
    )
}

export function getSignCertOptions(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Driver.CertOptions {
    try {
        return requestEvent.params.request.params[0].options || {}
    } catch (e) {
        error("Failed to extract sign cert options", requestEvent, e)
        return {}
    }
}

export function getSignCertMessage(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Vendor.CertMessage | undefined {
    try {
        const { purpose, payload } =
            requestEvent.params.request.params[0].message

        if (!purpose)
            throw new Error(`Invalid purpose for sign cert request: ${purpose}`)

        if (!payload || !payload.type || !payload.content)
            throw new Error(
                `Invalid payload for sign cert request: ${JSON.stringify(
                    purpose,
                )}`,
            )

        return {
            purpose,
            payload,
        }
    } catch (e) {
        error("Failed to extract sign cert message parameters", requestEvent, e)
    }
}

export function getSendTxMessage(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Vendor.TxMessage | undefined {
    try {
        const message: Connex.Vendor.TxMessage =
            requestEvent.params.request.params[0].message

        if (!message || message.length < 1)
            throw new Error(`Invalid message for send tx request: ${message}`)

        return message.map(clause => {
            if (
                HexUtils.isInvalid(clause?.to) &&
                HexUtils.isInvalid(clause?.data)
            )
                throw new Error(`Invalid clause: ${JSON.stringify(clause)}`)

            clause.data = clause.data || "0x"
            clause.to = clause.to || null
            clause.value = clause.value || "0x0"

            return clause
        })
    } catch (e) {
        error("Failed to extract send tx message parameters", requestEvent, e)
    }
}

export function getSendTxOptions(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Driver.CertOptions {
    try {
        return requestEvent.params.request.params[0].options || {}
    } catch (e) {
        error("Failed to extract send tx options", requestEvent, e)
        return {}
    }
}

/**
 * WalletConnect V2 URI is based on [eip-1328](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1328.md)
 * uri         = "wc" ":" topic [ "@" version ][ "?" parameters ]
 * topic       = STRING
 * version     = 1*DIGIT
 * parameters  = parameter *( "&" parameter )
 * parameter   = key "=" value
 * key         = STRING
 * value       = STRING
 *
 * Required parameters:
 * symKey (STRING) = symmetric key used for pairing encryption
 * relay-protocol (STRING) = protocol name used for relay
 *
 * @returns boolean
 */

export function isValidURI(uri: string): boolean {
    try {
        const uriObject = new URL(uri)

        const protocol = uriObject.protocol
        const symKey = uriObject.searchParams.get("symKey")
        const relayProtocol = uriObject.searchParams.get("relay-protocol")

        return (
            // wc protocol
            protocol === "wc:" &&
            // version 2
            uriObject.pathname.endsWith("@2") &&
            !!symKey &&
            !!relayProtocol
        )
    } catch (e) {
        return false
    }
}

export function formatJsonRpcError(
    id: number,
    err: ErrorResponse,
): JsonRpcError {
    return {
        id,
        jsonrpc: "2.0",
        error: err,
    }
}

export function getNetworkType(chainId: string): Network {
    let network = chainId.split(":")[1]

    if (NETWORK_TYPE.MAIN.includes(network)) {
        return defaultMainNetwork
    } else if (NETWORK_TYPE.TEST.includes(network)) {
        return defaultTestNetwork
    }

    return defaultMainNetwork
}

export function getTopicFromPairUri(uri: string) {
    if (!isValidURI(uri)) throw new Error("Invalid WC URI")

    const uriArray = uri.split(":")
    return uriArray[1].split("@")[0]
}
