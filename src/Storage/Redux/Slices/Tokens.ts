import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { FungibleToken, TokenWithCompleteInfo, VeChainToken } from "~Model"
import { TokenInfoResponse, TokensState } from "../Types"
import { AddressUtils } from "~Common"
import { PURGE } from "redux-persist"

export const initialTokenState: TokensState = {
    custom: [],
    dashboardChartData: {},
    officialTokens: [],
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
            action: PayloadAction<{ symbol: VeChainToken; data: number[] }>,
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

        setCoinGeckoTokens: (
            state,
            action: PayloadAction<TokenInfoResponse[]>,
        ) => {
            state.coinGeckoTokens = action.payload
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialTokenState)
    },
})

export const {
    addOrUpdateCustomToken,
    setDashboardChartData,
    setOfficialTokens,
    setCoinGeckoTokens,
} = TokenSlice.actions
