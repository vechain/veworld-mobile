import { VET, VTHO } from "~Constants"
import { FungibleToken } from "~Model"
import HexUtils from "~Utils/HexUtils"
import { mergeArrays } from "~Utils/MergeUtils/MergeUtils"

export const mergeTokens = (
    a: FungibleToken[],
    b: FungibleToken[],
): FungibleToken[] => {
    // Normailze addresses
    a.forEach(token => (token.address = HexUtils.normalize(token.address)))
    b.forEach(token => (token.address = HexUtils.normalize(token.address)))

    return mergeArrays(a, b, "address")
}

export const compareSymbols = (sym1?: string, sym2?: string): boolean => {
    return (
        sym1 !== undefined &&
        sym2 !== undefined &&
        sym1.trim().toLowerCase() === sym2.trim().toLowerCase()
    )
}

export const isVechainToken = (symbol: string): boolean => {
    return (
        compareSymbols(symbol, VET.symbol) ||
        compareSymbols(symbol, VTHO.symbol)
    )
}
