import React from "react"
import { render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { VersionUpdateAvailableBottomSheet } from "./VersionUpdateAvailableBottomSheet"
import { useCheckAppVersion } from "~Hooks/useCheckAppVersion/useCheckAppVersion"

jest.mock("~Hooks/useCheckAppVersion/useCheckAppVersion", () => ({
    useCheckAppVersion: jest.fn(),
}))

jest.mock("react-native-device-info", () => ({
    getVersion: () => "1.0.0",
}))

jest.mock("react-native-localize", () => ({
    getCountry: () => "US",
}))

describe("VersionUpdateAvailableBottomSheet", () => {
    beforeEach(() => {
        ;(useCheckAppVersion as jest.Mock).mockReturnValue({
            shouldShowUpdatePrompt: false,
        })
    })

    it("should show bottom sheet when shouldShowUpdatePrompt is true", () => {
        ;(useCheckAppVersion as jest.Mock).mockReturnValue({
            shouldShowUpdatePrompt: true,
        })

        render(<VersionUpdateAvailableBottomSheet />, {
            wrapper: TestWrapper,
        })

        const bottomSheet = screen.getByTestId("VersionUpdateAvailableBottomSheet")
        expect(bottomSheet).toBeTruthy()
    })

    it("should display update now and update later buttons", () => {
        ;(useCheckAppVersion as jest.Mock).mockReturnValue({
            shouldShowUpdatePrompt: true,
        })

        render(<VersionUpdateAvailableBottomSheet />, {
            wrapper: TestWrapper,
        })

        const updateNowButton = screen.getByTestId("Update_Now_Button")
        const updateLaterButton = screen.getByTestId("Update_Later_Button")

        expect(updateNowButton).toBeTruthy()
        expect(updateLaterButton).toBeTruthy()
    })
})
