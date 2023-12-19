import { FungibleToken, TokenWithCompleteInfo, NETWORK_TYPE } from "~Model"

export type TokensState = {
    tokens: {
        [network in NETWORK_TYPE]: {
            custom: Record<string, FungibleToken[]>
            officialTokens: TokenWithCompleteInfo[]
            suggestedTokens: string[]
        }
    }
}
