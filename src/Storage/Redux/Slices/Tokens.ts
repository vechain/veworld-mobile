import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
    FungibleToken,
    FungibleTokenWithBalance,
    TokenWithCompleteInfo,
} from "~Model"
import { TokenInfoResponse, TokensState } from "../Types"
import { AddressUtils } from "~Common"

export const initialTokenState: TokensState = {
    custom: [],
    dashboardChartData: {},
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

        setOfficialTokens: (
            state,
            action: PayloadAction<TokenWithCompleteInfo[]>,
        ) => {
            state.officialTokens = action.payload
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
    setOfficialTokens,
    setCoinGeckoTokens,
    setSuggestedTokens,
} = TokenSlice.actions
