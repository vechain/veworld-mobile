import React from "react"
import { render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { VersionChangelogBottomSheet } from "./VersionChangelogBottomSheet"
import { useCheckAppVersion } from "~Hooks/useCheckAppVersion/useCheckAppVersion"

jest.mock("~Hooks/useCheckAppVersion/useCheckAppVersion", () => ({
    useCheckAppVersion: jest.fn(),
}))

const mockDispatch = jest.fn()

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    useAppDispatch: () => mockDispatch,
    setChangelogToShow: jest.fn(payload => ({ type: "SET_CHANGELOG_TO_SHOW", payload })),
}))

describe("VersionChangelogBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useCheckAppVersion as jest.Mock).mockReturnValue({
            shouldShowChangelog: false,
            changelog: null,
        })
    })

    it("should show bottom sheet when shouldShowChangelog is true", () => {
        ;(useCheckAppVersion as jest.Mock).mockReturnValue({
            shouldShowChangelog: true,
            changelog: ["Feature 1", "Feature 2", "Feature 3"],
        })

        render(<VersionChangelogBottomSheet />, {
            wrapper: TestWrapper,
        })

        const bottomSheet = screen.getByTestId("VersionChangelogBottomSheet")
        expect(bottomSheet).toBeTruthy()
    })

    it("should display changelog items correctly", () => {
        ;(useCheckAppVersion as jest.Mock).mockReturnValue({
            shouldShowChangelog: true,
            changelog: ["Feature 1", "Feature 2", "Feature 3"],
        })

        render(<VersionChangelogBottomSheet />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByText("Feature 1")).toBeTruthy()
        expect(screen.getByText("Feature 2")).toBeTruthy()
        expect(screen.getByText("Feature 3")).toBeTruthy()
    })

    it("should have a dismiss button", () => {
        ;(useCheckAppVersion as jest.Mock).mockReturnValue({
            shouldShowChangelog: true,
            changelog: ["Feature 1", "Feature 2"],
        })

        render(<VersionChangelogBottomSheet />, {
            wrapper: TestWrapper,
        })

        const dismissButton = screen.getByTestId("Dismiss_Button")
        expect(dismissButton).toBeTruthy()
    })

    it("should not open bottom sheet when changelog is empty", async () => {
        ;(useCheckAppVersion as jest.Mock).mockReturnValue({
            shouldShowChangelog: true,
            changelog: [],
        })

        render(<VersionChangelogBottomSheet />, {
            wrapper: TestWrapper,
        })

        // Verify that the component doesn't try to reset state
        // (that's now handled by useVersionChangelog hook)
        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                payload: {
                    shouldShow: false,
                    changelogKey: null,
                },
            }),
        )
    })
})
