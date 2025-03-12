import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { FungibleToken, TokenWithCompleteInfo } from "~Model"
import { NETWORK_TYPE } from "~Model/Network/enums"
import { TokensState } from "../Types"
import { mergeArrays } from "~Utils/MergeUtils/MergeUtils"
import { HexUtils } from "~Utils"
import { compareListOfAddresses } from "~Utils/AddressUtils/AddressUtils"

const normaliseAddresses = (tokens: FungibleToken[]) => {
    tokens.forEach(token => {
        token.address = HexUtils.normalize(token.address)
    })
}

const emptyTokenState = {
    custom: {},
    officialTokens: [],
    suggestedTokens: [],
}

export const initialTokenState: TokensState = {
    tokens: {
        [NETWORK_TYPE.MAIN]: { ...emptyTokenState },
        [NETWORK_TYPE.TEST]: { ...emptyTokenState },
        [NETWORK_TYPE.SOLO]: { ...emptyTokenState },
        [NETWORK_TYPE.OTHER]: { ...emptyTokenState },
    },
}

export const TokenSlice = createSlice({
    name: "tokens",
    initialState: initialTokenState,
    reducers: {
        addOrUpdateCustomTokens: (
            state,
            action: PayloadAction<{
                network: NETWORK_TYPE
                accountAddress: string
                newTokens: FungibleToken[]
            }>,
        ) => {
            const { network, accountAddress, newTokens } = action.payload

            normaliseAddresses(newTokens)

            if (!state.tokens[network].custom[accountAddress]) {
                state.tokens[network].custom[accountAddress] = []
            }

            // Merge tokens with the same address
            const mergedTokens = mergeArrays(state.tokens[network].custom[accountAddress], newTokens, "address")

            state.tokens[network].custom[accountAddress] = mergedTokens
        },

        addOfficialTokens: (
            state,
            action: PayloadAction<{
                network: NETWORK_TYPE
                tokens: TokenWithCompleteInfo[]
            }>,
        ) => {
            const { network, tokens } = action.payload

            normaliseAddresses(tokens)

            // Merge tokens with the same address
            const mergedTokens = mergeArrays(state.tokens[network].officialTokens, tokens, "address")

            state.tokens[network].officialTokens = mergedTokens
        },

        setSuggestedTokens: (
            state,
            action: PayloadAction<{
                network: NETWORK_TYPE
                tokens: string[]
            }>,
        ) => {
            const { network, tokens } = action.payload
            const normalisedTokens = tokens.map(token => HexUtils.normalize(token))
            // Only update the state if there is an actual change
            if (!compareListOfAddresses(state.tokens[network].suggestedTokens, normalisedTokens))
                state.tokens[network].suggestedTokens = normalisedTokens
        },

        resetTokensState: () => initialTokenState,
    },
})

export const { addOrUpdateCustomTokens, addOfficialTokens, setSuggestedTokens, resetTokensState } = TokenSlice.actions
