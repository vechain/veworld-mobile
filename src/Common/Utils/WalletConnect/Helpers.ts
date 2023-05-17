import { VECHAIN_CHAINS, TVechainChain } from "./Lib"
import { utils } from "ethers"

/**
 * Get our address from params checking if params string contains one
 * of our wallet addresses
 */
export function getWalletAddressFromParams(addresses: string[], params: any) {
    const paramsString = JSON.stringify(params)
    let address = ""

    addresses.forEach(addr => {
        if (paramsString.includes(addr)) {
            address = addr
        }
    })

    return address
}

/**
 * Check if chain is part of VECHAIN standard
 */
export function isVechainChain(chain: string) {
    return chain.includes("vechain")
}

/**
 * Check if chain is part of EIP155 standard
 */
export function isEIP155Chain(chain: string) {
    return chain.includes("eip155")
}

/**
 * Check if chain is part of COSMOS standard
 */
export function isCosmosChain(chain: string) {
    return chain.includes("cosmos")
}

/**
 * Check if chain is part of SOLANA standard
 */
export function isSolanaChain(chain: string) {
    return chain.includes("solana")
}

/**
 * Formats chainId to its name
 */
export function formatChainName(chainId: string) {
    return VECHAIN_CHAINS[chainId as TVechainChain]?.name ?? chainId
}

/**
 * Gets message from various signing request methods by filtering out
 * a value that is not an address (thus is a message).
 * If it is a hex string, it gets converted to utf8 string
 */
export function getSignParamsMessage(params: string[]) {
    const message = params.filter(p => !utils.isAddress(p))[0]

    return convertHexToUtf8(message)
}

/**
 * Converts hex to utf8 string if it is valid bytes
 */
export function convertHexToUtf8(value: string) {
    if (utils.isHexString(value)) {
        return utils.toUtf8String(value)
    }

    return value
}
