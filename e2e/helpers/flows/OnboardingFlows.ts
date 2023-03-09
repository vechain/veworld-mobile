import { waitFor, element } from "detox"

export const onboard = async () => {
    await waitFor(element(by.text("GET STARTED")))
        .toExist()
        .withTimeout(2_000)
    await element(by.text("GET STARTED")).tap()

    await waitFor(element(by.text("NEXT: SUSTAINABLE")))
        .toExist()
        .withTimeout(2_000)
    await element(by.text("NEXT: SUSTAINABLE")).tap()

    await waitFor(element(by.text("NEXT: SAFE AND FAST")))
        .toExist()
        .withTimeout(2_000)
    await element(by.text("NEXT: SAFE AND FAST")).tap()
}

export const createWallet = async () => {
    await element(by.text("Create new wallet")).tap()

    await element(by.text("NEXT: CUSTODY")).tap()
    await element(by.text("NEXT: SAFETY")).tap()
    await element(by.text("NEXT: SECRET PHRASE")).tap()
}

export default {
    onboard,
    createWallet,
}
