import { clickById } from "../common"

export const goBackToHomeTab = async () => {
    // go back to home page
    await clickById("wallet-tab")
}

export const goToDiscoverTab = async () => {
    await clickById("discover-tab")
}
