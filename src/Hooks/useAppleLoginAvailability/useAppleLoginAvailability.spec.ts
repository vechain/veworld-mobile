import { act, renderHook } from "@testing-library/react-native"
// `~Test` MUST be imported before `~Components/Providers/FeatureFlagsProvider`: loading the mocked
// module first makes the providers inside TestWrapper capture the actual module instead of the mock.
import { TestHelpers, TestWrapper } from "~Test"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"

import { useAppleLoginAvailability } from "./useAppleLoginAvailability"

const { mockedFeatureFlags } = TestHelpers.data

jest.mock("~Components/Providers/FeatureFlagsProvider", () => ({
    ...jest.requireActual("~Components/Providers/FeatureFlagsProvider"),
    useFeatureFlags: jest.fn(),
}))

const mockFlags = (loginDisabled?: boolean) => {
    ;(useFeatureFlags as jest.Mock).mockReturnValue({
        ...mockedFeatureFlags,
        appleMigrationFeature:
            loginDisabled === undefined
                ? undefined
                : {
                      banner: { enabled: false },
                      loginDisabled: { enabled: loginDisabled },
                  },
    })
}

describe("useAppleLoginAvailability", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should not disable apple login when the flag is off", () => {
        mockFlags(false)
        const { result } = renderHook(() => useAppleLoginAvailability(), { wrapper: TestWrapper })
        expect(result.current.isAppleLoginDisabled).toBe(false)
    })

    it("should disable apple login when the flag is on", () => {
        mockFlags(true)
        const { result } = renderHook(() => useAppleLoginAvailability(), { wrapper: TestWrapper })
        expect(result.current.isAppleLoginDisabled).toBe(true)
    })

    it("should not disable apple login when the remote payload has no appleMigrationFeature key", () => {
        mockFlags(undefined)
        const { result } = renderHook(() => useAppleLoginAvailability(), { wrapper: TestWrapper })
        expect(result.current.isAppleLoginDisabled).toBe(false)
    })

    it("should show a warning feedback with the maintenance message", () => {
        mockFlags(true)
        const showSpy = jest.spyOn(Feedback, "show").mockImplementation(() => {})

        const { result } = renderHook(() => useAppleLoginAvailability(), { wrapper: TestWrapper })
        act(() => result.current.showMaintenanceMessage())

        expect(showSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: FeedbackSeverity.WARNING,
                type: FeedbackType.ALERT,
                icon: "icon-alert-triangle",
                message: expect.stringContaining("Maintenance work in progress"),
            }),
        )

        showSpy.mockRestore()
    })
})
