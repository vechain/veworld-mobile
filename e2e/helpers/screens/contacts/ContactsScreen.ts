import { SHORT_TIMEOUT } from "../../constants"
import { waitFor, element } from "detox"

export const isActive = async (): Promise<boolean> => {
    return await waitFor(element(by.id("contacts-screen-title")))
        .toExist()
        .withTimeout(SHORT_TIMEOUT)
        .then(() => true)
        .catch(() => false)
}

export const isContactsListEmpty = async (): Promise<boolean> => {
    return await waitFor(element(by.text("Create contact")))
        .toBeVisible()
        .withTimeout(SHORT_TIMEOUT)
        .then(() => true)
        .catch(() => false)
}
