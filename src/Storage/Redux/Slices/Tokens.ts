import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { FungibleToken, VeChainToken } from "~Model"
import { TokensState } from "../Types"
import { AddressUtils } from "~Common"

export const initialTokenState: TokensState = {
    custom: [],
    dashboardChartData: {},
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
    },
})

export const { addOrUpdateCustomToken, setDashboardChartData } =
    TokenSlice.actions
