import { DEFAULT_TIMEOUT, SHORT_TIMEOUT } from "../constants"

export const closeBottomSheet = async (name: string) => {
    // Close sheet
    await element(by.text(name)).swipe("down", "fast", 1)
    await sleep(SHORT_TIMEOUT)
}

const clickBy = async ({
    byWhat,
    selector,
    timeout = DEFAULT_TIMEOUT,
    index = 0,
}: {
    byWhat: "text" | "id"
    selector: string
    timeout?: number
    index?: number
}) => {
    if (timeout) {
        await waitFor(element(by[byWhat](selector)))
            .toExist()
            .withTimeout(timeout)
        await waitFor(element(by[byWhat](selector)))
            .toBeVisible()
            .withTimeout(timeout)
    }

    await element(by[byWhat](selector)).atIndex(index).tap()
}
export const clickByText = async (
    text: string,
    options?: {
        timeout?: number
        index?: number
    },
) =>
    await clickBy({
        selector: text,
        timeout: options?.timeout,
        byWhat: "text",
        index: options?.index,
    })

export const clickById = async (
    id: string,
    options?: {
        timeout?: number
        index?: number
    },
) =>
    await clickBy({
        selector: id,
        timeout: options?.timeout,
        byWhat: "id",
        index: options?.index,
    })

export const goBack = async () => {
    await idShouldBeVisible("BackButtonHeader-BaseIcon-backButton", {
        timeout: 5000,
    })
    await clickById("BackButtonHeader-BaseIcon-backButton")
}

export const idShouldExist = async (id: string, options?: { timeout?: number }) =>
    await waitFor(element(by.id(id)))
        .toExist()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const idShouldNotExist = async (id: string, options?: { timeout?: number }) =>
    await waitFor(element(by.id(id)))
        .not.toExist()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const textShouldExist = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.text(text)))
        .toExist()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const textShouldNotExist = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.text(text)))
        .not.toExist()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const idShouldBeVisible = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.id(text)))
        .toBeVisible()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const idShouldNotBeVisible = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.id(text)))
        .not.toBeVisible()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const textShouldBeVisible = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.text(text)))
        .toBeVisible()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const textShouldNotBeVisible = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.text(text)))
        .not.toBeVisible()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

type Direction = "down" | "left" | "right" | "up"

export const scrollUntilTextVisible = async (
    text: string,
    containerID: string,
    direction: Direction = "down",
    scrollStep: number = 50,
) => {
    await waitFor(element(by.text(text)))
        .toBeVisible(95)
        .whileElement(by.id(containerID))
        .scroll(scrollStep, direction)
}

export const insertTextById = async (text: string, id: string) => {
    await element(by.id(id)).replaceText(text)
}

export const swipeLeftByText = async (text: string) => {
    await element(by.text(text)).swipe("left", "slow", 0.4)
}

export const isPresentText = async (text: string, options?: { timeout?: number }) => {
    try {
        await waitFor(element(by.text(text)))
            .toExist()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
        return true
    } catch (error) {
        return false
    }
}

export const isPresentId = async (id: string, options?: { timeout?: number }) => {
    try {
        await waitFor(element(by.id(id)))
            .toExist()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
        return true
    } catch (error) {
        return false
    }
}

export const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
