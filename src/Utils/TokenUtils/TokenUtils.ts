import { VET, VTHO } from "~Constants"
import { FungibleToken } from "~Model"

export const mergeTokens = (a: FungibleToken[], b: FungibleToken[]) =>
    a
        .filter(
            aa =>
                !b.find(
                    bb =>
                        aa.symbol.toLowerCase() === bb.symbol.toLowerCase() &&
                        aa.genesisId === bb.genesisId,
                ),
        )
        .concat(b)

export const isVechainToken = (symbol: string) =>
    symbol.toLowerCase() === VET.symbol.toLowerCase() ||
    symbol.toLowerCase() === VTHO.symbol.toLowerCase()
