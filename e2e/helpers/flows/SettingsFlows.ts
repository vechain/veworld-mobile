import { clickByText } from "../common"

export const goToAdvancedSettings = async () => {
    await clickByText("Advanced")
}

export const goToTransactionsSettings = async () => {
    await clickByText("Transactions")
}
