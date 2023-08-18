import { address, HDNode } from "thor-devkit"
import { Network, NETWORK_TYPE, XPub } from "~Model"
import { error, warn } from "~Utils/Logger"
import { VET, VTHO } from "~Constants"
import CryptoUtils from "../CryptoUtils"
import HexUtils from "../HexUtils"

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
        error("getAddressFromXPub", e)
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
        error("getAddressFromHdNode", e)
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
export const compareAddresses = (
    address1?: string,
    address2?: string,
): boolean => {
    if (!address1 || !address2) return false

    if (address2 === address1) {
        return true
    }

    try {
        return HexUtils.normalize(address1) === HexUtils.normalize(address2)
    } catch (e) {
        warn(
            "Got error:",
            e,
            "Trying to compare address1:",
            address1,
            "with address2:",
            address2,
        )
        return false
    }
}

export const compareListOfAddresses = (add1: string[], add2: string[]) => {
    if (add1.length !== add2.length) return false
    const sortedAdd1 = [...add1]
        .map(e => e.toLowerCase())
        .sort((a, b) => a.localeCompare(b))
    const sortedAdd2 = [...add2]
        .map(e => e.toLowerCase())
        .sort((a, b) => a.localeCompare(b))

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
        warn("AddressUtils:isValid", e)
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

    const urlSuffix =
        type === ExplorerLinkType.ACCOUNT ? "accounts" : "transactions"

    return `${networkBaseUrl}/${urlSuffix}`
}
