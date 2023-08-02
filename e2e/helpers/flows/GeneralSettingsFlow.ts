import { element } from "detox"

export const resetApp = async () => {
    await element(by.text("Reset App")).tap()

    await element(by.id("reset-app-checkbox")).tap()

    await element(by.text("RESET APP")).tap()
}
