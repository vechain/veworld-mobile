import { address, HDNode } from "thor-devkit"
import { Network, NETWORK_TYPE, XPub } from "~Model"
import { error, warn } from "~Utils/Logger"
import { ERROR_EVENTS, VET, VTHO } from "~Constants"
import CryptoUtils from "../CryptoUtils"
import HexUtils from "../HexUtils"
import { Vns } from "~Hooks"
import { queryClient } from "~Api/QueryProvider"

export const getAddressFromPrivateKey = (privateKey: string): string => {
    try {
        // The chaincode value provided here is irrelevant as we are only calculating the root address
        const hdNode = HDNode.fromPrivateKey(
            Buffer.from(HexUtils.removePrefix(privateKey), "hex"),
            Buffer.from("51f873b803f6dd9365c8cb176bedba927f1fef1df117aa4ab8b9cf03b12c7e90", "hex"),
        )
        return address.toChecksumed(hdNode.address)
    } catch (e) {
        error(ERROR_EVENTS.UTILS, e)
        throw new Error("getAddressFromPrivateKey: Invalid private key")
    }
}
/**
 * Get the address for the given index
 * @param xPub
 * @param index
 * @returns
 */
export const getAddressFromXPub = (xPub: XPub, index: number): string => {
    try {
        const hdNode = CryptoUtils.hdNodeFromXPub(xPub)
        return getAddressFromHdNode(hdNode, index)
    } catch (e) {
        error(ERROR_EVENTS.UTILS, e)
        throw new Error("getAddressFromXPub: Invalid XPub")
    }
}

/**
 * Get the address for the given index
 * @param hdNode
 * @param index
 * @returns
 */
export const getAddressFromHdNode = (hdNode: HDNode, index: number): string => {
    try {
        const account = hdNode.derive(index)
        return address.toChecksumed(account.address)
    } catch (e) {
        error(ERROR_EVENTS.UTILS, e)
        throw new Error("getAddressFromHdNode: Invalid XPub")
    }
}

/**
 * Checks if two addresses are equal. Returns true if both values are strings AND:
 *  - The two values are equal OR
 *  - The checksumed addresses are equal
 *
 * @param address1
 * @param address2
 */
export const compareAddresses = (address1?: string, address2?: string): boolean => {
    if (!address1 || !address2) return false

    if (address2 === address1) {
        return true
    }

    try {
        return HexUtils.normalize(address1) === HexUtils.normalize(address2)
    } catch (e) {
        warn(ERROR_EVENTS.UTILS, e, "Trying to compare address1:", address1, "with address2:", address2)
        return false
    }
}

export const compareListOfAddresses = (add1: string[], add2: string[]) => {
    if (add1.length !== add2.length) return false
    const sortedAdd1 = [...add1].map(e => e.toLowerCase()).sort((a, b) => a.localeCompare(b))
    const sortedAdd2 = [...add2].map(e => e.toLowerCase()).sort((a, b) => a.localeCompare(b))

    for (let i = 0; i < sortedAdd1.length; i++) {
        if (!compareAddresses(sortedAdd1[i], sortedAdd2[i])) return false
    }

    return true
}

export const regexPattern = () => {
    return /^0x[a-fA-F0-9]{40}$/
}

export const isValid = (addr: string | undefined | null): boolean => {
    try {
        if (typeof addr !== "string") return false
        address.toChecksumed(HexUtils.addPrefix(addr))
        return true
    } catch (e) {
        warn(ERROR_EVENTS.UTILS, e)
        return false
    }
}

export const isVechainToken = (addr: string): boolean => {
    return addr === VET.address || addr === VTHO.address
}

export const leftPadWithZeros = (str: string, length: number): string => {
    // Remove '0x' prefix if it exists
    const cleanStr = str.startsWith("0x") ? str.slice(2) : str
    if (cleanStr.length > length) {
        throw new Error("Input string is longer than the specified length")
    }
    // Pad the string to the specified length
    const paddedStr = cleanStr.padStart(length, "0")
    return `0x${paddedStr}`
}

export enum ExplorerLinkType {
    TRANSACTION = "TRANSACTION",
    ACCOUNT = "ACCOUNT",
}

/**
 * Generate explorer link based on network (main/testnet) and address type
 * @param address
 * @param type
 */
export const getExplorerLink = (network?: Network, type?: ExplorerLinkType) => {
    const networkBaseUrl =
        network?.type === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_EXPLORER_MAIN_URL
            : process.env.REACT_APP_EXPLORER_TESTNET_URL

    const urlSuffix = type === ExplorerLinkType.ACCOUNT ? "accounts" : "transactions"

    return `${networkBaseUrl}/${urlSuffix}`
}

/**
 * Format address
 * @param address - the address
 * @param lengthBefore - (optional, default 4) the characters to show before the dots
 * @param lengthAfter - (optional, default 4) the characters to show after the dots
 * @returns the formatted address
 */
export const humanAddress = (_address: string, lengthBefore = 4, lengthAfter = 10) => {
    const before = _address.substring(0, lengthBefore)
    const after = _address.substring(_address.length - lengthAfter)
    return `${before}…${after}`
}

/**
 * Coinbase QR code address is prefixed with vechain: which needs to be removed
 * @param data
 * @returns
 */
export const coinbaseQRcodeAddress = (data: string): string => {
    if (data.includes("vechain:")) {
        return data.replace("vechain:", "")
    }
    return data
}

/**
 * @param _address - the account address
 * @param name - the VNS name
 * @returns the VNS name of an address, if available, otherwise the address
 */
export const showAddressOrName = (
    _address: string,
    vnsData: Vns,
    formatOptions?: {
        ellipsed?: boolean
        lengthBefore?: number
        lengthAfter?: number
    },
): string => {
    const { name: vnsName, address: vnsAddress } = vnsData
    const { ellipsed, lengthBefore, lengthAfter } = formatOptions || {}

    const parsedVnsName = vnsName && _address ? vnsName : undefined

    const parsedVnsAddress = vnsAddress && _address ? vnsAddress : undefined

    const humanAddr = () => {
        const addr = parsedVnsAddress || _address
        return ellipsed ? humanAddress(addr, lengthBefore, lengthAfter) : addr
    }

    const finalAddr = parsedVnsName || humanAddr()

    return finalAddr
}

/**
 * Retrieve VNS data for a given address
 * @param _address - the address to find in the cache (It can be a .vet domain or an address)
 * @param network - the current network
 * @returns {{name: string, address: string} | undefined} the address with the corrisponding VNS object else return undefined
 */
export const loadVnsFromCache = (_address: string, network: Network) => {
    const cachedVns = queryClient.getQueryData<{ name: string; address: string }[]>(["vns_names", network.genesis.id])
    if (!cachedVns) return undefined

    if (_address.includes(".vet")) {
        return cachedVns.find(vns => compareAddresses(_address, vns.name))
    }

    return cachedVns.find(vns => compareAddresses(_address, vns.address))
}
