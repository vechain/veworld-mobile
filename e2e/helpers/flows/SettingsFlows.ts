import { clickById, clickByText, isPresentText } from "../common"

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

export const goBackToHomeTab = async () => {
    // go back to home page
    await clickById("wallet-tab")
}
