import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
    FungibleToken,
    FungibleTokenWithBalance,
    TokenWithCompleteInfo,
} from "~Model"
import { CoinMarketInfo, TokenInfoResponse, TokensState } from "../Types"
import { AddressUtils } from "~Utils"

export const initialTokenState: TokensState = {
    custom: [],
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
            action: PayloadAction<FungibleToken>,
        ) => {
            const newToken = action.payload
            const filteredTokens = state.custom.filter(
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
            filteredTokens.push(action.payload)
            state.custom = filteredTokens
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

        upsertOfficialTokens: (
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
    },
})

export const {
    addOrUpdateCustomToken,
    setDashboardChartData,
    upsertOfficialTokens,
    setAssertDetailChartData,
    setCoinGeckoTokens,
    setSuggestedTokens,
    setCoinMarketInfo,
} = TokenSlice.actions
