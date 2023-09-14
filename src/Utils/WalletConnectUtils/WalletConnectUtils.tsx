import { Core } from "@walletconnect/core"
import {
    ICore,
    PendingRequestTypes,
    SessionTypes,
    SignClientTypes,
} from "@walletconnect/types"
import { IWeb3Wallet, Web3Wallet } from "@walletconnect/web3wallet"
import { Network } from "~Model"
import { error, warn } from "~Utils/Logger"
import { NavigationState } from "@react-navigation/native"
import { Routes } from "~Navigation"
import {
    ErrorResponse,
    JsonRpcError,
} from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"
import HexUtils from "~Utils/HexUtils"

let web3wallet: IWeb3Wallet
export const core: ICore = new Core({
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
})

export async function getWeb3Wallet() {
    if (web3wallet) {
        return web3wallet
    }

    try {
        web3wallet = await Web3Wallet.init({
            core,
            metadata: {
                name: "VeWorld Mobile Wallet",
                description: "Manage your VeChain assets with VeWorld",
                url: "https://veworld.com",
                icons: ["https://avatars.githubusercontent.com/u/37784886"],
            },
        })
        return web3wallet
    } catch (e) {
        error("Failed to initialize Web3Wallet", e)
    }
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

    return {
        name,
        url,
        methods,
        events,
        chains,
        icon,
        description,
    }
}

export function getRequestEventAttributes(
    requestEvent: PendingRequestTypes.Struct,
) {
    const chainId = requestEvent.params.chainId.toUpperCase()
    const method = requestEvent.params.request.method
    const params = requestEvent.params.request.params[0]
    const topic = requestEvent.topic

    return {
        chainId,
        method,
        params,
        topic,
    }
}

export function getNameAndUrl(
    web3Wallet?: IWeb3Wallet,
    requestEvent?: PendingRequestTypes.Struct,
): { name?: string; url?: string } {
    if (!requestEvent || !web3Wallet) return {}

    const { topic } = getRequestEventAttributes(requestEvent)

    const session = web3Wallet.getActiveSessions()[topic]

    if (!session) return {}

    return getSessionRequestAttributes(session)
}

export function getSessionRequestAttributes(
    sessionRequest: SessionTypes.Struct,
) {
    const name = sessionRequest.peer.metadata.name
    const icon = sessionRequest.peer.metadata.icons[0]
    const url = sessionRequest.peer.metadata.url
    const description = sessionRequest.peer.metadata.description

    return {
        name,
        icon,
        url,
        description,
    }
}

export function shouldAutoNavigate(
    navState: NavigationState<ReactNavigation.RootParamList>,
) {
    if (!navState || !navState.routes) return false

    return !navState.routes.some(
        route =>
            route.name === Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN ||
            route.name === Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN ||
            route.name === Routes.CONNECT_APP_SCREEN ||
            route.name === Routes.LEDGER_SIGN_TRANSACTION ||
            route.name === Routes.LEDGER_SIGN_CERTIFICATE,
    )
}

export function getSignCertOptions(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Driver.CertOptions {
    try {
        return requestEvent.params.request.params[0].options || {}
    } catch (e) {
        warn("Failed to extract sign cert options", requestEvent, e)
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
        warn("Failed to extract sign cert message parameters", requestEvent, e)
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
): Connex.Driver.TxOptions {
    try {
        return requestEvent.params.request.params[0].options || {}
    } catch (e) {
        warn("Failed to extract send tx options", requestEvent, e)
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

export function isValidURI(providedUri: string): boolean {
    try {
        const uri = new URL(providedUri)

        const protocol = uri.protocol
        const symKey = uri.searchParams.get("symKey")
        const relayProtocol = uri.searchParams.get("relay-protocol")

        return (
            // wc protocol
            protocol === "wc:" &&
            // version 2
            uri.pathname.endsWith("@2") &&
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

export function getNetwork(
    requestEvent: PendingRequestTypes.Struct,
    allNetworks: Network[],
): Network | undefined {
    const networkIdentifier = requestEvent.params.chainId.split(":")[1]

    // Switch to the requested network
    return allNetworks.find(
        net =>
            net.genesis.id.slice(-32).toLowerCase() ===
            networkIdentifier.toLowerCase(),
    )
}

export function getTopicFromPairUri(uri: string) {
    if (!isValidURI(uri)) throw new Error("Invalid WC URI")

    const uriArray = uri.split(":")
    return uriArray[1].split("@")[0]
}
