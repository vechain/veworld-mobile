import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"
import { FungibleToken } from "~Model"

const selectTokenState = (state: RootState) => state.tokens

export const selectCustomTokens = createSelector(
    selectTokenState,
    selectSelectedNetwork,
    (tokens, network) =>
        tokens.custom.filter(
            (token: FungibleToken) => token.genesisId === network.genesis.id,
        ),
)

const DEFAULT_CHART_DATA = [
    { timestamp: 0, value: 1 },
    { timestamp: 1, value: 1 },
    { timestamp: 2, value: 1 },
    { timestamp: 3, value: 1 },
    { timestamp: 4, value: 1 },
    { timestamp: 5, value: 1 },
    { timestamp: 6, value: 1 },
    { timestamp: 7, value: 1 },
    { timestamp: 8, value: 1 },
    { timestamp: 9, value: 1 },
    { timestamp: 10, value: 1 },
    { timestamp: 11, value: 1 },
    { timestamp: 12, value: 1 },
]

export const selectDashboardChartData = createSelector(
    [(_, state) => selectTokenState(state), symbol => symbol],
    (tokens, symbol) =>
        tokens.dashboardChartData?.[symbol]?.map((price, index) => ({
            timestamp: index,
            value: price,
        })) || DEFAULT_CHART_DATA,
)
