import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
// `~Test` MUST be imported before `~Components/Providers/FeatureFlagsProvider`: loading the mocked
// module first makes the providers inside TestWrapper capture the actual module instead of the mock.
import { TestHelpers, TestWrapper } from "~Test"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"

import { AppleMigrationBanner } from "./AppleMigrationBanner"

const { mockedFeatureFlags } = TestHelpers.data

jest.mock("~Components/Providers/FeatureFlagsProvider", () => ({
    ...jest.requireActual("~Components/Providers/FeatureFlagsProvider"),
    useFeatureFlags: jest.fn(),
}))

const mockBannerFlag = (banner: { enabled: boolean; startDate?: string; endDate?: string }) => {
    ;(useFeatureFlags as jest.Mock).mockReturnValue({
        ...mockedFeatureFlags,
        appleMigrationFeature: {
            banner,
            loginDisabled: { enabled: false },
        },
    })
}

const renderBanner = (onClose = jest.fn()) => {
    render(<AppleMigrationBanner onClose={onClose} />, {
        wrapper: TestWrapper,
    })
    return onClose
}

describe("AppleMigrationBanner", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render the title and the generic description when no dates are set", () => {
        mockBannerFlag({ enabled: true })
        renderBanner()

        const banner = screen.getByTestId("APPLE_MIGRATION_BANNER")
        expect(banner).toBeOnTheScreen()
        expect(banner).toHaveTextContent("Apple login maintenance upcoming")
        expect(banner).toHaveTextContent("up to 48 hours")
    })

    it("should render the dated description when both dates are set", () => {
        mockBannerFlag({ enabled: true, startDate: "2026-09-10", endDate: "2026-09-12" })
        renderBanner()

        const banner = screen.getByTestId("APPLE_MIGRATION_BANNER")
        expect(banner).toHaveTextContent("Sep 10, 2026")
        expect(banner).toHaveTextContent("Sep 12, 2026")
    })

    it("should fall back to the generic description when only one date is set", () => {
        mockBannerFlag({ enabled: true, startDate: "2026-09-10" })
        renderBanner()

        const banner = screen.getByTestId("APPLE_MIGRATION_BANNER")
        expect(banner).toHaveTextContent("up to 48 hours")
        expect(banner).not.toHaveTextContent("Sep 10, 2026")
    })

    it("should fall back to the generic description when a date is malformed", () => {
        mockBannerFlag({ enabled: true, startDate: "not-a-date", endDate: "2026-09-12" })
        renderBanner()

        const banner = screen.getByTestId("APPLE_MIGRATION_BANNER")
        expect(banner).toHaveTextContent("up to 48 hours")
        expect(banner).not.toHaveTextContent("Sep 12, 2026")
    })

    it("should call onClose when the close button is pressed", () => {
        mockBannerFlag({ enabled: true })
        const onClose = renderBanner()

        fireEvent.press(screen.getByTestId("APPLE_MIGRATION_BANNER_CLOSE_BUTTON"))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
