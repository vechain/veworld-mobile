import { waitFor, element } from "detox"

export const onboard = async () => {
    await waitFor(element(by.text("GET STARTED")))
        .toExist()
        .withTimeout(10_000)
    await element(by.text("GET STARTED")).tap()

    await waitFor(element(by.text("NEXT: SUSTAINABLE")))
        .toExist()
        .withTimeout(10_000)
    await element(by.text("NEXT: SUSTAINABLE")).tap()

    await waitFor(element(by.text("NEXT: SAFE AND FAST")))
        .toExist()
        .withTimeout(10_000)
    await element(by.text("NEXT: SAFE AND FAST")).tap()
}

export const createWallet = async () => {
    await waitFor(element(by.text("Create new wallet")))
        .toExist()
        .withTimeout(10_000)
    await element(by.text("Create new wallet")).tap()

    await waitFor(element(by.text("NEXT: CUSTODY")))
        .toExist()
        .withTimeout(10_000)
    await element(by.text("NEXT: CUSTODY")).tap()

    await waitFor(element(by.text("NEXT: SAFETY")))
        .toExist()
        .withTimeout(10_000)
    await element(by.text("NEXT: SAFETY")).tap()

    await waitFor(element(by.text("NEXT: SECRET PHRASE")))
        .toExist()
        .withTimeout(10_000)
    await element(by.text("NEXT: SECRET PHRASE")).tap()
}

export default {
    onboard,
    createWallet,
}
