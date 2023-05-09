import { act, renderHook } from "@testing-library/react-hooks"
import { AlertUtils, BiometricsUtils } from "~Common/Utils"
import { useBiometricsValidation } from "./useBiometricsValidation"
import { TestWrapper } from "~Test"

jest.mock("~Common/Utils/BiometricsUtils")
jest.mock("~Common/Utils/AlertUtils")

describe("useBiometricsValidation", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should call onSuccess when biometric authentication is successful", async () => {
        const onSuccess = jest.fn()
        ;(
            BiometricsUtils.authenticateWithBiometric as jest.Mock
        ).mockResolvedValueOnce({
            success: true,
        })

        const { result, waitForNextUpdate } = renderHook(
            () => useBiometricsValidation(),
            { wrapper: TestWrapper },
        )

        await waitForNextUpdate()
        await result.current.authenticateBiometrics(onSuccess)

        expect(onSuccess).toHaveBeenCalled()
        expect(AlertUtils.showDefaultAlert).not.toHaveBeenCalled()
        expect(AlertUtils.showGoToSettingsAlert).not.toHaveBeenCalled()
    })

    it("should show the 'not enrolled' alert when biometric authentication is not enrolled", async () => {
        const onSuccess = jest.fn()
        ;(
            BiometricsUtils.authenticateWithBiometric as jest.Mock
        ).mockResolvedValueOnce({
            success: false,
            error: "not_enrolled",
        })

        const { result, waitForNextUpdate } = renderHook(
            () => useBiometricsValidation(),
            { wrapper: TestWrapper },
        )

        await waitForNextUpdate()
        await result.current.authenticateBiometrics(onSuccess)

        expect(AlertUtils.showDefaultAlert).toHaveBeenCalled()
        expect(onSuccess).not.toHaveBeenCalled()
        expect(AlertUtils.showGoToSettingsAlert).not.toHaveBeenCalled()
    })

    it("should show the 'go to settings' alert when biometric authentication is not available", async () => {
        const onSuccess = jest.fn()
        ;(
            BiometricsUtils.authenticateWithBiometric as jest.Mock
        ).mockResolvedValueOnce({
            success: false,
            error: "not_available",
        })
        let successFn: () => void
        let cancelFn: () => void
        ;(AlertUtils.showGoToSettingsAlert as jest.Mock).mockImplementationOnce(
            (_title, _message, _cancel, _success) => {
                cancelFn = _cancel
                successFn = _success
            },
        )
        const { result, waitForNextUpdate } = renderHook(
            () => useBiometricsValidation(),
            { wrapper: TestWrapper },
        )

        await waitForNextUpdate()
        await result.current.authenticateBiometrics(onSuccess)
        act(() => {
            successFn()
            cancelFn()
        })
        expect(AlertUtils.showGoToSettingsAlert).toHaveBeenCalled()
        expect(onSuccess).not.toHaveBeenCalled()
        expect(AlertUtils.showDefaultAlert).not.toHaveBeenCalled()
    })
})
