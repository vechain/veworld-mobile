import { waitFor, element } from "detox"

export const isActive = async (): Promise<void> => {
    await waitFor(element(by.text("Your vechain wallet is ready!")))
        .toBeVisible()
        .withTimeout(10000)
}
