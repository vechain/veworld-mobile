import { DEFAULT_TIMEOUT } from "../constants"

const clickBy = async ({
    byWhat,
    selector,
    timeout = DEFAULT_TIMEOUT,
}: {
    byWhat: "text" | "id"
    selector: string
    timeout?: number
}) => {
    await waitFor(element(by[byWhat](selector)))
        .toExist()
        .withTimeout(timeout)

    await element(by[byWhat](selector)).tap()
}
export const clickByText = async (
    text: string,
    options?: {
        timeout?: number
    },
) =>
    await clickBy({
        selector: text,
        timeout: options?.timeout || DEFAULT_TIMEOUT,
        byWhat: "text",
    })

export const clickById = async (
    id: string,
    options?: {
        id: string
        timeout?: number
    },
) =>
    await clickBy({
        selector: id,
        timeout: options?.timeout || DEFAULT_TIMEOUT,
        byWhat: "id",
    })

export const goBack = async () =>
    await clickById("BackButtonHeader-BaseIcon-backButton")

export const textShouldExist = async (
    text: string,
    options?: { timeout?: number },
) =>
    await waitFor(element(by.text(text)))
        .toExist()
        .withTimeout(options?.timeout || DEFAULT_TIMEOUT)

export const textShouldBeVisible = async (
    text: string,
    options?: { timeout?: number },
) =>
    await waitFor(element(by.text(text)))
        .toBeVisible()
        .withTimeout(options?.timeout || DEFAULT_TIMEOUT)
