import { Core } from "@walletconnect/core"
import { ICore, SessionTypes, SignClientTypes } from "@walletconnect/types"
import { Web3Wallet, IWeb3Wallet } from "@walletconnect/web3wallet"

export const VECHAIN_SIGNING_METHODS = {
    IDENTIFY: "identify",
    REQUEST_TRANSACTION: "request_transaction",
}

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
    const name = proposal.params?.proposer?.metadata?.name
    const url = proposal.params?.proposer?.metadata.url
    const methods = proposal.params?.requiredNamespaces.vechain.methods
    const events = proposal.params?.requiredNamespaces.vechain.events
    const chains = proposal.params?.requiredNamespaces.vechain.chains
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
    const requestName = sessionRequest.peer.metadata.name
    const requestIcon = sessionRequest.peer.metadata.icons[0]
    const requestURL = sessionRequest.peer.metadata.url

    const attributes = {
        requestName,
        requestIcon,
        requestURL,
    }
    return attributes
}
