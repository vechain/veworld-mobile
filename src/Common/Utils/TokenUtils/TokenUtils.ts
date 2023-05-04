import { VET, VTHO } from "~Common/Constant"
import { FungibleToken } from "~Model"

export const mergeTokens = (a: FungibleToken[], b: FungibleToken[]) =>
    a
        .filter(
            aa =>
                !b.find(
                    bb =>
                        aa.symbol === bb.symbol &&
                        aa.genesisId === bb.genesisId,
                ),
        )
        .concat(b)

export const isVechainToken = (token: FungibleToken) =>
    token.symbol === VET.symbol || token.symbol === VTHO.symbol
