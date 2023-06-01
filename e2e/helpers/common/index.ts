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
    if (timeout) {
        await waitFor(element(by[byWhat](selector)))
            .toExist()
            .withTimeout(timeout)
    }

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
        timeout: options?.timeout,
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
        timeout: options?.timeout,
        byWhat: "id",
    })

export const goBack = async () =>
    await clickById("BackButtonHeader-BaseIcon-backButton")

export const idShouldExist = async (
    id: string,
    options?: { timeout?: number },
) =>
    await waitFor(element(by.id(id)))
        .toExist()
        .withTimeout(options?.timeout || DEFAULT_TIMEOUT)

export const idShouldNotExist = async (
    id: string,
    options?: { timeout?: number },
) =>
    await waitFor(element(by.id(id)))
        .not.toExist()
        .withTimeout(options?.timeout || DEFAULT_TIMEOUT)

export const textShouldExist = async (
    text: string,
    options?: { timeout?: number },
) =>
    await waitFor(element(by.text(text)))
        .toExist()
        .withTimeout(options?.timeout || DEFAULT_TIMEOUT)

export const textShouldNotExist = async (
    text: string,
    options?: { timeout?: number },
) =>
    await waitFor(element(by.text(text)))
        .not.toExist()
        .withTimeout(options?.timeout || DEFAULT_TIMEOUT)

export const textShouldBeVisible = async (
    text: string,
    options?: { timeout?: number },
) =>
    await waitFor(element(by.text(text)))
        .toBeVisible()
        .withTimeout(options?.timeout || DEFAULT_TIMEOUT)

type Direction = "down" | "left" | "right" | "up"

export const scrollUntilTextVisible = async (
    text: string,
    containerID: string,
    direction: Direction = "down",
    scrollStep: number = 50,
) => {
    await waitFor(element(by.text(text)))
        .toBeVisible()
        .whileElement(by.id(containerID))
        .scroll(scrollStep, direction)
}

export const insertTextById = async (text: string, id: string) => {
    await element(by.id(id)).replaceText(text)
}

export const swipeLeftByText = async (text: string) => {
    await element(by.text(text)).swipe("left", "slow", 0.4)
}

export const isPresentText = async (
    text: string,
    options?: { timeout?: number },
) => {
    try {
        await waitFor(element(by.text(text)))
            .toExist()
            .withTimeout(options?.timeout || DEFAULT_TIMEOUT)
        return true
    } catch (error) {
        return false
    }
}

export const isPresentId = async (
    id: string,
    options?: { timeout?: number },
) => {
    try {
        await waitFor(element(by.id(id)))
            .toExist()
            .withTimeout(options?.timeout || DEFAULT_TIMEOUT)
        return true
    } catch (error) {
        return false
    }
}
