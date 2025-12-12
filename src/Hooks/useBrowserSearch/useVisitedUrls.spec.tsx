import { act, renderHook } from "@testing-library/react-hooks"
import React from "react"
import { selectVisitedUrls, useAppSelector } from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import { TestWrapper } from "~Test"
import { useVisitedUrls } from "./useVisitedUrls"
import axios from "axios"

jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

jest.mock("~Components/Providers/InAppBrowserProvider", () => ({
    useInAppBrowserOrNull: jest.fn().mockReturnValue({
        navigationState: {},
    } as any),
}))

const mockBrowserState = {
    visitedUrls: [],
}

const createWrapper = ({
    children,
    preloadedState,
}: {
    children?: React.ReactNode
    preloadedState?: Partial<RootState>
}) => {
    return <TestWrapper preloadedState={preloadedState ?? { browser: mockBrowserState }}>{children}</TestWrapper>
}

describe("useVisitedUrls", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedAxios.get.mockResolvedValue({ data: "OK" })
    })

    it("should add to the visited urls if the url is valid", async () => {
        const { result } = renderHook(
            () => ({
                hooks: useVisitedUrls(),
                state: useAppSelector(selectVisitedUrls),
            }),
            {
                wrapper: createWrapper,
            },
        )

        await act(async () => {
            await result.current.hooks.addVisitedUrl("https://www.example.com")
        })

        expect(result.current.state.length).toBe(1)
        expect(result.current.state[0]).toMatchObject({
            name: "www.example.com",
            href: "https://www.example.com",
            isCustom: true,
            amountOfNavigations: 1,
        })
    })

    it("should not add to the visited urls if the url is invalid", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("Invalid URL"))

        const { result: visitedUrlsResult } = renderHook(() => useVisitedUrls(), {
            wrapper: createWrapper,
        })

        const { result: selectorResult } = renderHook(() => useAppSelector(selectVisitedUrls), {
            wrapper: createWrapper,
        })

        await act(async () => {
            await visitedUrlsResult.current.addVisitedUrl("https//example/com")
        })

        expect(selectorResult.current.length).toBe(0)
    })

    it("should remove the visited url if the url is removed", async () => {
        const preloadedState = {
            browser: {
                visitedUrls: [
                    {
                        amountOfNavigations: 1,
                        createAt: new Date().getTime(),
                        href: "https://www.example.com",
                        isCustom: true,
                        name: "Example",
                    },
                ],
            },
        }

        const { result: visitedUrlsResult } = renderHook(() => useVisitedUrls(), {
            wrapper: createWrapper,
            initialProps: {
                preloadedState: {
                    browser: preloadedState.browser,
                },
            },
        })

        const { result: selectorResult } = renderHook(() => useAppSelector(selectVisitedUrls), {
            wrapper: createWrapper,
        })

        await act(async () => {
            await visitedUrlsResult.current.removeVisitedUrl("https://www.example.com")
        })

        expect(selectorResult.current.length).toBe(0)
    })
})
