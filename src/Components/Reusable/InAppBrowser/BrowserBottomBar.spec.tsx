import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BrowserBottomBar } from "./BrowserBottomBar"
import { TestWrapper } from "~Test"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useRoute } from "@react-navigation/native"
import { Routes } from "~Navigation"

jest.mock("~Components/Providers/InAppBrowserProvider")
jest.mock("axios")

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useRoute: jest.fn(),
}))

describe("BrowserBottomBar", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })
    it("should render", () => {
        ;(useInAppBrowser as jest.Mock).mockReturnValue({
            showToolbars: true,
            isDapp: false,
            navigationState: {
                url: "https://vechain.org",
            },
        })
        ;(useRoute as jest.Mock).mockReturnValue({
            key: "browser",
            name: Routes.BROWSER,
        })
        render(<BrowserBottomBar />, { wrapper: TestWrapper })

        expect(screen.getByTestId("browser-bottom-bar")).toBeOnTheScreen()
    })
})
