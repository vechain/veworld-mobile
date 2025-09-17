import { act, renderHook } from "@testing-library/react-hooks"
import { useVisitedUrls } from "./useVisitedUrls"
import { SearchError, useBrowserNavigation } from "./useBrowserNavigation"
import { TestWrapper } from "~Test"
import { waitFor } from "@testing-library/react-native"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))
jest.mock("./useVisitedUrls")

describe("useBrowserNavigation", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
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

        const { result } = renderHook(() => useBrowserNavigation(), {
            wrapper: TestWrapper,
        })

        act(() => {
            result.current.navigateToBrowser("https://google.com")
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
