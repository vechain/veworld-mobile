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
