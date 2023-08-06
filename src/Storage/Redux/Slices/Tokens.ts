import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
    FungibleToken,
    FungibleTokenWithBalance,
    TokenWithCompleteInfo,
} from "~Model"
import { CoinMarketInfo, TokenInfoResponse, TokensState } from "../Types"
import { AddressUtils } from "~Utils"

export const initialTokenState: TokensState = {
    custom: {},
    dashboardChartData: {},
    assetDetailChartData: {},
    coinMarketInfo: {},
    officialTokens: [],
    suggestedTokens: [],
    coinGeckoTokens: [],
}

export const TokenSlice = createSlice({
    name: "tokens",
    initialState: initialTokenState,
    reducers: {
        addOrUpdateCustomToken: (
            state,
            action: PayloadAction<{
                accountAddress: string
                newToken: FungibleToken
            }>,
        ) => {
            const { accountAddress, newToken } = action.payload

            if (!state.custom[accountAddress]) {
                state.custom[accountAddress] = []
            }

            const filteredTokens = state.custom[accountAddress].filter(
                oldToken =>
                    !AddressUtils.compareAddresses(
                        oldToken.address,
                        newToken.address,
                    ) ||
                    !AddressUtils.compareAddresses(
                        oldToken.genesisId,
                        newToken.genesisId,
                    ),
            )

            filteredTokens.push(newToken)

            state.custom[accountAddress] = filteredTokens
        },

        addOrUpdateCustomTokens: (
            state,
            action: PayloadAction<{
                accountAddress: string
                newTokens: FungibleToken[]
            }>,
        ) => {
            const { accountAddress, newTokens } = action.payload

            if (!state.custom[accountAddress]) {
                state.custom[accountAddress] = []
            }

            const filteredTokens = state.custom[accountAddress].filter(
                oldToken =>
                    !newTokens.find(
                        newToken =>
                            AddressUtils.compareAddresses(
                                oldToken.address,
                                newToken.address,
                            ) &&
                            AddressUtils.compareAddresses(
                                oldToken.genesisId,
                                newToken.genesisId,
                            ),
                    ),
            )

            filteredTokens.push(...newTokens)

            state.custom[accountAddress] = filteredTokens
        },

        setDashboardChartData: (
            state,
            action: PayloadAction<{ symbol: string; data: number[][] }>,
        ) => {
            const { symbol, data } = action.payload
            state.dashboardChartData[symbol] = data
        },

        setAssertDetailChartData: (
            state,
            action: PayloadAction<{ symbol: string; data: number[][] }>,
        ) => {
            const { symbol, data } = action.payload
            state.assetDetailChartData[symbol] = data
        },

        setCoinMarketInfo: (
            state,
            action: PayloadAction<{ data: CoinMarketInfo[] }>,
        ) => {
            const { data } = action.payload
            state.coinMarketInfo = data.reduce(
                (acc: { [key: string]: CoinMarketInfo }, obj) => {
                    acc[obj.symbol] = obj
                    return acc
                },
                {},
            )
        },

        addOfficialTokens: (
            state,
            action: PayloadAction<TokenWithCompleteInfo[]>,
        ) => {
            const tokensToInsert = action.payload.filter(
                token =>
                    state.officialTokens
                        .map(t => t.address)
                        .includes(token.address) === false,
            )
            state.officialTokens.push(...tokensToInsert)
        },

        setSuggestedTokens: (
            state,
            action: PayloadAction<FungibleTokenWithBalance[]>,
        ) => {
            state.suggestedTokens = action.payload
        },

        setCoinGeckoTokens: (
            state,
            action: PayloadAction<TokenInfoResponse[]>,
        ) => {
            state.coinGeckoTokens = action.payload
        },

        resetTokensState: () => initialTokenState,
    },
})

export const {
    addOrUpdateCustomToken,
    addOrUpdateCustomTokens,
    setDashboardChartData,
    addOfficialTokens,
    setAssertDetailChartData,
    setCoinGeckoTokens,
    setSuggestedTokens,
    setCoinMarketInfo,
    resetTokensState,
} = TokenSlice.actions
