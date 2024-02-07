import { DEFAULT_TIMEOUT } from "../constants"
import { retryDecorator } from "ts-retry-promise"

export const closeBottomSheet = retryDecorator(
    async (name: string) => {
        // Close sheet
        await element(by.text(name)).swipe("down", "fast", 1)
    },
    { retries: 3 },
)

export const clickBy = retryDecorator(
    async ({
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
    },
    { retries: 3 },
)

export const clickByText = retryDecorator(
    async (text: string, options?: { timeout?: number; index?: number }) =>
        await clickBy({
            selector: text,
            timeout: options?.timeout || DEFAULT_TIMEOUT,
            byWhat: "text",
            index: options?.index,
        }),
    { timeout: 10000 },
)

export const clickById = retryDecorator(
    async (id: string, options?: { timeout?: number; index?: number }) =>
        await clickBy({
            selector: id,
            timeout: options?.timeout || DEFAULT_TIMEOUT,
            byWhat: "id",
            index: options?.index,
        }),
    { timeout: 10000 },
)

export const goBack = retryDecorator(
    async () => {
        await idShouldBeVisible("BackButtonHeader-BaseIcon-backButton", {
            timeout: 5000,
        })
        await clickById("BackButtonHeader-BaseIcon-backButton")
    },
    { retries: 3 },
)

export const idShouldExist = retryDecorator(
    async (id: string, options?: { timeout?: number }) =>
        await waitFor(element(by.id(id)))
            .toExist()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)

export const idShouldNotExist = retryDecorator(
    async (id: string, options?: { timeout?: number }) =>
        await waitFor(element(by.id(id)))
            .not.toExist()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)

export const textShouldExist = retryDecorator(
    async (text: string, options?: { timeout?: number }) =>
        await waitFor(element(by.text(text)))
            .toExist()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)

export const textShouldNotExist = retryDecorator(
    async (text: string, options?: { timeout?: number }) =>
        await waitFor(element(by.text(text)))
            .not.toExist()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)

export const idShouldBeVisible = retryDecorator(
    async (text: string, options?: { timeout?: number }) =>
        await waitFor(element(by.id(text)))
            .toBeVisible()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)

export const idShouldNotBeVisible = retryDecorator(
    async (text: string, options?: { timeout?: number }) =>
        await waitFor(element(by.id(text)))
            .not.toBeVisible()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)

export const textShouldBeVisible = retryDecorator(
    async (text: string, options?: { timeout?: number }) =>
        await waitFor(element(by.text(text)))
            .toBeVisible()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)

export const textShouldNotBeVisible = retryDecorator(
    async (text: string, options?: { timeout?: number }) =>
        await waitFor(element(by.text(text)))
            .not.toBeVisible()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)

type Direction = "down" | "left" | "right" | "up"

export const scrollUntilTextVisible = retryDecorator(
    async (text: string, containerID: string, direction: Direction = "down", scrollStep: number = 50) => {
        await waitFor(element(by.text(text)))
            .toBeVisible(95)
            .whileElement(by.id(containerID))
            .scroll(scrollStep, direction)
    },
    { retries: 3 },
)

export const insertTextById = retryDecorator(
    async (text: string, id: string) => {
        await element(by.id(id)).replaceText(text)
    },
    { retries: 3 },
)

export const swipeLeftByText = retryDecorator(
    async (text: string) => {
        await element(by.text(text)).swipe("left", "slow", 0.4)
    },
    { retries: 3 },
)

export const isPresentText = retryDecorator(
    async (text: string, options?: { timeout?: number }) => {
        try {
            await waitFor(element(by.text(text)))
                .toExist()
                .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
            return true
        } catch (error) {
            return false
        }
    },
    { retries: 3 },
)

export const isPresentId = retryDecorator(
    async (id: string, options?: { timeout?: number }) => {
        try {
            await waitFor(element(by.id(id)))
                .toExist()
                .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT)
            return true
        } catch (error) {
            return false
        }
    },
    { retries: 3 },
)

export const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const idShouldBeVisibleTapped = retryDecorator(
    async (text: string, options?: { timeout?: number }) =>
        await waitFor(element(by.id(text)))
            .toBeVisible()
            .withTimeout(options?.timeout ?? DEFAULT_TIMEOUT),
    { retries: 3 },
)
