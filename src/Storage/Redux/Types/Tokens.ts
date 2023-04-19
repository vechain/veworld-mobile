import { FungibleToken } from "~Model"

export interface TokensState {
    custom: FungibleToken[]
    dashboardChartData: { [key: string]: number[] }
}
