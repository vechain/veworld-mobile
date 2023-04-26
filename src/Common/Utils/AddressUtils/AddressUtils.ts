import { address, HDNode } from "thor-devkit"
import { XPub } from "~Model"
import { veWorldErrors, error, HexUtils, VET, VTHO } from "~Common"
import CryptoUtils from "../CryptoUtils"

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
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Invalid XPub",
        })
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
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Invalid XPub",
        })
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
    address1: unknown,
    address2: unknown,
): boolean => {
    if (typeof address1 !== "string" || typeof address2 !== "string")
        return false

    if (address2 === address1) {
        return true
    } else if (address1 === VET.address || address2 === VET.address) {
        // NOTE: this is a work-around because VET address is "VET" and it doesn't have a real address
        return false
    }

    try {
        address1 = HexUtils.addPrefix(address1)
        address2 = HexUtils.addPrefix(address2)
        return (
            address.toChecksumed(address1 as string) ===
            address.toChecksumed(address2 as string)
        )
    } catch (e) {
        error(
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

export const regexPattern = () => {
    return /^0x[a-fA-F0-9]{40}$/
}

export const isValid = (addr: string): boolean => {
    try {
        address.toChecksumed(HexUtils.addPrefix(addr))
        return true
    } catch (e) {
        error(e)
        return false
    }
}

export const isVechainToken = (addr: string): boolean => {
    return addr === VET.address || addr === VTHO.address
}

// export enum ExplorerLinkType {
//     TRANSACTION = "TRANSACTION",
//     ACCOUNT = "ACCOUNT",
// }

// /**
//  * Generate explorer link based on network (main/testnet) and address type
//  * @param address
//  * @param type
//  */
// export const getExplorerLink = (network?: Network, type?: ExplorerLinkType) => {
//     const networkBaseUrl =
//         network?.type === NETWORK_TYPE.MAIN
//             ? process.env.REACT_APP_EXPLORER_MAIN_URL
//             : process.env.REACT_APP_EXPLORER_TESTNET_URL

//     const urlSuffix =
//         type === ExplorerLinkType.ACCOUNT ? "accounts" : "transactions"

//     return `${networkBaseUrl}/${urlSuffix}`
// }
