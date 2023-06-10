import { clickByText, isPresentText } from "../common"

export const goToAdvancedSettings = async () => {
    await clickByText("Advanced")
}

export const goToTransactionsSettings = async () => {
    await clickByText("Transactions")
}

export const goToNetworkSettings = async () => {
    await clickByText("Networks")
}

export const selectTestNetwork = async () => {
    if (await isPresentText("Mainnet")) {
        await clickByText("Mainnet")
        await clickByText("Testnet")
    }
}

export const selectMainNetwork = async () => {
    if (await isPresentText("Testnet")) {
        await clickByText("Testnet")
        await clickByText("Mainnet")
    }
}
