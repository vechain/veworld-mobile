import { act, renderHook } from "@testing-library/react-hooks"
import { waitFor } from "@testing-library/react-native"
import { useNavigation } from "@react-navigation/native"

import { TestWrapper } from "~Test"

import { useVisitedUrls } from "./useVisitedUrls"
import { Routes } from "~Navigation"

import { SearchError, useBrowserNavigation } from "./useBrowserNavigation"

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))
jest.mock("./useVisitedUrls")

const isValidBrowserUrl = jest.fn()
jest.mock("~Utils/URIUtils", () => ({
    ...jest.requireActual("~Utils/URIUtils").default,
    isValidBrowserUrl: (...args: any[]) => isValidBrowserUrl(...args),
}))

describe("useBrowserNavigation", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should navigate to the browser with HTTPS url", async () => {
        const addVisitedUrl = jest.fn()
        const navigate = jest.fn()
        ;(useVisitedUrls as jest.Mock).mockReturnValue({
            addVisitedUrl,
        })
        ;(useNavigation as jest.Mock).mockReturnValue({
            navigate,
        })
        isValidBrowserUrl.mockResolvedValue(true)

        const { result } = renderHook(() => useBrowserNavigation(), {
            wrapper: TestWrapper,
        })

        await act(async () => {
            await result.current.navigateToBrowser("https://google.com")
        })

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(Routes.BROWSER, { url: "https://google.com" })
            expect(addVisitedUrl).toHaveBeenCalledWith("https://google.com")
        })
    })

    it("should return error when url is invalid", async () => {
        ;(useVisitedUrls as jest.Mock).mockReturnValue({
            addVisitedUrl: jest.fn(),
        })
        ;(useNavigation as jest.Mock).mockReturnValue({
            navigate: jest.fn(),
        })
        isValidBrowserUrl.mockResolvedValue(false)

        const { result } = renderHook(() => useBrowserNavigation(), {
            wrapper: TestWrapper,
        })

        let fnResult: Awaited<ReturnType<typeof result.current.navigateToBrowser>>

        await act(async () => {
            fnResult = await result.current.navigateToBrowser("ùùùùùààààà")
        })

        await waitFor(() => {
            expect(fnResult).toBe(SearchError.ADDRESS_CANNOT_BE_REACHED)
        })
    })
})
