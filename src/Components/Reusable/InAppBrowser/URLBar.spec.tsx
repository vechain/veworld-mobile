import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import axios from "axios"
import React from "react"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { TestWrapper } from "~Test"
import { URLBar } from "./URLBar"

jest.mock("~Components/Providers/InAppBrowserProvider")
jest.mock("axios")

describe("URLBar", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })
    it("should render correctly", () => {
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            showToolbars: true,
            isDapp: false,
            navigationState: {
                url: "https://vechain.org",
            },
        })
        render(<URLBar />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("URL-bar-input")).toBeVisible()
    })

    it("should navigate to HTTPS URL", async () => {
        const navigateFn = jest.fn()
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            showToolbars: true,
            isDapp: false,
            navigationState: {
                url: "https://vechain.org",
            },
            navigateToUrl: navigateFn,
        })
        render(<URLBar />, {
            wrapper: TestWrapper,
        })

        const urlInput = screen.getByTestId("URL-bar-input")
        fireEvent.changeText(urlInput, "https://google.com")
        fireEvent(urlInput, "submitEditing", { nativeEvent: { text: "https://google.com" } })

        await waitFor(() => {
            expect(navigateFn).toHaveBeenCalledWith("https://google.com")
        })
    })

    it("should navigate to HTTP URL", async () => {
        const navigateFn = jest.fn()
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            showToolbars: true,
            isDapp: false,
            navigationState: {
                url: "https://vechain.org",
            },
            navigateToUrl: navigateFn,
        })
        render(<URLBar />, {
            wrapper: TestWrapper,
        })

        const urlInput = screen.getByTestId("URL-bar-input")
        ;(axios.get as jest.Mock).mockResolvedValue({ status: 200 })
        fireEvent.changeText(urlInput, "http://localhost:1234")
        fireEvent(urlInput, "submitEditing", { nativeEvent: { text: "http://localhost:1234" } })

        await waitFor(() => {
            expect(navigateFn).toHaveBeenCalledWith("http://localhost:1234")
        })
    })
})
