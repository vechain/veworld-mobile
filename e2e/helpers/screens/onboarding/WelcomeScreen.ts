import { waitFor, element } from "detox"
import { DEFAULT_TIMEOUT, LONG_TIMEOUT } from "../../constants"

export const isActive = async (): Promise<boolean> => {
    return await waitFor(element(by.id("welcome-title-id")))
        .toBeVisible()
        .withTimeout(LONG_TIMEOUT)
        .then(() => true)
        .catch(() => false)
}

export const goToWalletSetup = async () => {
    await waitFor(element(by.text("GET STARTED")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("GET STARTED")).tap()
}
