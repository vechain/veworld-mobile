import { DEFAULT_TIMEOUT } from "../constants"
import { retryDecorator } from "ts-retry-promise"

export const clickCloseBottomSheet = async (name: string) => {
    // Close sheet
    await element(by.text(name)).swipe("down", "fast", 1)
}
export const closeBottomSheet = retryDecorator(clickCloseBottomSheet, { retries: 3 })

const clickBySelector = async ({
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

export const clickBy = retryDecorator(clickBySelector, { retries: 3 })

export const clickByTextSelector = async (
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

export const clickByText = retryDecorator(clickByTextSelector, { retries: 3 })

export const clickByIDSelector = async (
    id: string,
    options?: {
        timeout?: number
        index?: number
    },
) =>
    await clickBy({
        selector: id,
        timeout: 10000,
        byWhat: "id",
        index: options?.index,
    })

export const clickById = retryDecorator(clickByIDSelector, { retries: 3 })

export const clickGoBack = async () => {
    await idShouldBeVisible("BackButtonHeader-BaseIcon-backButton", {
        timeout: 5000,
    })
    await clickById("BackButtonHeader-BaseIcon-backButton")
}

export const goBack = retryDecorator(clickGoBack, { timeout: 10000 })

export const checkIDShouldExist = async (id: string, options?: { timeout?: number }) =>
    await waitFor(element(by.id(id)))
        .toExist()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
export const idShouldExist = retryDecorator(checkIDShouldExist, { retries: 3 })

export const checkIDShouldNotExist = async (id: string, options?: { timeout?: number }) =>
    await waitFor(element(by.id(id)))
        .not.toExist()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const idShouldNotExist = retryDecorator(checkIDShouldNotExist, { retries: 3 })

export const checktextShouldExist = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.text(text)))
        .toExist()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const textShouldExist = retryDecorator(checktextShouldExist, { retries: 3 })

export const checktextShouldNotExist = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.text(text)))
        .not.toExist()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const textShouldNotExist = retryDecorator(checktextShouldNotExist, { retries: 3 })

export const checkidShouldBeVisible = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.id(text)))
        .toBeVisible()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
export const idShouldBeVisible = retryDecorator(checkidShouldBeVisible, { retries: 3 })

export const checkidShouldNotBeVisible = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.id(text)))
        .not.toBeVisible()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const idShouldNotBeVisible = retryDecorator(checkidShouldNotBeVisible, { retries: 3 })

export const checktextShouldBeVisible = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.text(text)))
        .toBeVisible()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
export const textShouldBeVisible = retryDecorator(checktextShouldBeVisible, { retries: 3 })

export const checktextShouldNotBeVisible = async (text: string, options?: { timeout?: number }) =>
    await waitFor(element(by.text(text)))
        .not.toBeVisible()
        .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)

export const textShouldNotBeVisible = retryDecorator(checktextShouldNotBeVisible, { retries: 3 })

type Direction = "down" | "left" | "right" | "up"

export const performscrollUntilTextVisible = async (
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

export const scrollUntilTextVisible = retryDecorator(performscrollUntilTextVisible, { retries: 3 })

export const performinsertTextById = async (text: string, id: string) => {
    await element(by.id(id)).replaceText(text)
}
export const insertTextById = retryDecorator(performinsertTextById, { timeout: 10000 })

export const performswipeLeftByText = async (text: string) => {
    await element(by.text(text)).swipe("left", "slow", 0.4)
}
export const swipeLeftByText = retryDecorator(performswipeLeftByText, { retries: 3 })

export const checkisPresentText = async (text: string, options?: { timeout?: number }) => {
    try {
        await waitFor(element(by.text(text)))
            .toExist()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
        return true
    } catch (error) {
        return false
    }
}

export const isPresentText = retryDecorator(checkisPresentText, { retries: 3 })

export const checkisPresentId = async (id: string, options?: { timeout?: number }) => {
    try {
        await waitFor(element(by.id(id)))
            .toExist()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
        return true
    } catch (error) {
        return false
    }
}
export const isPresentId = retryDecorator(checkisPresentId, { retries: 3 })

export const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
