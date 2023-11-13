import { Core } from "@walletconnect/core"
import {
    ICore,
    PendingRequestTypes,
    SessionTypes,
    SignClientTypes,
} from "@walletconnect/types"
import { IWeb3Wallet, Web3Wallet } from "@walletconnect/web3wallet"
import { Network } from "~Model"
import { debug, error, warn } from "~Utils/Logger"
import { NavigationState } from "@react-navigation/native"
import { Routes } from "~Navigation"
import HexUtils from "~Utils/HexUtils"
import { ErrorMessageUtils } from "~Utils"
import { Mutex } from "async-mutex"

let _web3wallet: IWeb3Wallet

export const core: ICore = new Core({
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
    // TODO: use a custom storage so we can wipe app state
    logger: "info",
})

const walletInitializer = new Mutex()

export async function getWeb3Wallet(): Promise<IWeb3Wallet> {
    return await walletInitializer.runExclusive(async () => {
        if (_web3wallet) {
            debug("Web3Wallet already initialized")
            return _web3wallet
        }

        debug("Initializing Web3Wallet")

        try {
            _web3wallet = await Web3Wallet.init({
                core,
                metadata: {
                    name: "VeWorld Mobile Wallet",
                    description: "Manage your VeChain assets with VeWorld",
                    url: "https://veworld.com",
                    icons: ["https://avatars.githubusercontent.com/u/37784886"],
                },
            })

            debug("Web3Wallet initialized")

            return _web3wallet
        } catch (e) {
            error(
                "Failed to initialize Web3Wallet",
                ErrorMessageUtils.getErrorMessage(e),
            )
            throw e
        }
    })
}

export function getPairAttributes(
    proposal: SignClientTypes.EventArguments["session_proposal"],
) {
    const { requiredNamespaces, optionalNamespaces } = proposal.params

    const firstNamespace =
        Object.values(requiredNamespaces)[0] ??
        Object.values(optionalNamespaces)[0]

    let events: string[] | undefined
    let methods: string[] | undefined
    let chains: string[] | undefined

    if (firstNamespace) {
        events = firstNamespace.events
        methods = firstNamespace.methods
        chains = firstNamespace.chains
    }

    const name = proposal.params.proposer.metadata.name
    const url = proposal.params.proposer.metadata.url
    const description = proposal.params.proposer.metadata.description
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
): Connex.Signer.CertOptions {
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
        error("Failed to extract send tx message parameters", e)
    }
}

export function getSendTxOptions(
    requestEvent: PendingRequestTypes.Struct,
): Connex.Signer.TxOptions {
    try {
        return requestEvent.params.request.params[0].options || {}
    } catch (e) {
        warn("Failed to extract send tx options", e)
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

export type ValidURI = {
    isValid: true
    params: {
        pairingTopic: string
        symKey: string
        relayProtocol: string
    }
}

export type InValidURI = {
    isValid: false
}

export function validateUri(
    providedUri: string | null | undefined,
): ValidURI | InValidURI {
    if (!providedUri) return { isValid: false }

    try {
        const uri = new URL(providedUri)

        const protocol = uri.protocol
        const symKey = uri.searchParams.get("symKey")
        const relayProtocol = uri.searchParams.get("relay-protocol")

        const isValid =
            // wc protocol
            protocol === "wc:" &&
            // version 2
            uri.pathname.endsWith("@2") &&
            !!symKey &&
            !!relayProtocol

        if (!isValid) {
            return { isValid: false }
        } else {
            return {
                isValid: true,
                params: {
                    pairingTopic: uri.pathname.replace("@2", ""),
                    symKey,
                    relayProtocol,
                },
            }
        }
    } catch (e) {
        return { isValid: false }
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
    if (!validateUri(uri)) throw new Error("Invalid WC URI")

    const uriArray = uri.split(":")
    return uriArray[1].split("@")[0]
}
