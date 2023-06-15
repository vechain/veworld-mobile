import { Core } from "@walletconnect/core"
import { ICore, SessionTypes, SignClientTypes } from "@walletconnect/types"
import { Web3Wallet, IWeb3Wallet } from "@walletconnect/web3wallet"
import { isEmpty, isNull } from "lodash"

let web3wallet: IWeb3Wallet
export const core: ICore = new Core({
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
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
    }
    return attributes
}

export function getRequestEventAttributes(
    requestEvent: SignClientTypes.EventArguments["session_request"],
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

    const attributes = {
        name,
        icon,
        url,
    }
    return attributes
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
export function isValidURI(uri: string) {
    if (isNull(uri) || isEmpty(uri)) return false

    // Split string by : and check if the first element is wc
    const uriArray = uri.split(":")
    if (uriArray[0] !== "wc") return false

    // Split the string between @ and ? and check if the first element is the correct version
    const version = uriArray[1].split("@")[1].split("?")[0]
    if (version !== "2") return false

    // Split the string between @ and ? and retrieve the parameters
    const parameters = uriArray[1].split("@")[1].split("?")[1].split("&")

    // Iterate over the parameters and check if the required parameters are present
    let hasSymKey = false
    let hasRelayProtocol = false
    parameters.forEach(parameter => {
        const key = parameter.split("=")[0]
        if (key === "symKey") hasSymKey = true
        if (key === "relay-protocol") hasRelayProtocol = true
    })
    if (!hasSymKey || !hasRelayProtocol) return false

    return true
}

export function formatJsonRpcError(id: number, error: any) {
    return {
        id,
        jsonrpc: "2.0",
        error: error,
    }
}
