import { renderHook } from "@testing-library/react-hooks"
import { BiometricsUtils } from "~Utils"
import { useBiometrics } from "./useBiometrics"
import { AppStateType, SecurityLevelType } from "~Model"

// mock delle funzioni di BiometricsUtils
jest.mock("~Utils/BiometricsUtils", () => ({
    getDeviceEnrolledLevel: jest.fn(),
    getDeviceHasHardware: jest.fn(),
    getIsDeviceEnrolled: jest.fn(),
    getBiometricTypeAvailable: jest.fn(),
}))

describe("useBiometrics", () => {
    it("should initialize biometrics state on mount", async () => {
        ;(
            BiometricsUtils.getDeviceEnrolledLevel as jest.Mock
        ).mockResolvedValue(SecurityLevelType.BIOMETRIC)
        ;(BiometricsUtils.getDeviceHasHardware as jest.Mock).mockResolvedValue(
            true,
        )
        ;(BiometricsUtils.getIsDeviceEnrolled as jest.Mock).mockResolvedValue(
            true,
        )
        ;(
            BiometricsUtils.getBiometricTypeAvailable as jest.Mock
        ).mockResolvedValue("touch")

        const { result, waitForNextUpdate } = renderHook(() => useBiometrics())

        expect(result.current).toEqual({})

        await waitForNextUpdate({ timeout: 5000 })

        expect(result.current).toEqual({
            currentSecurityLevel: SecurityLevelType.BIOMETRIC,
            authTypeAvailable: "touch",
            isDeviceEnrolled: true,
            isHardwareAvailable: true,
            accessControl: true,
        })
    })

    it("should update biometrics state when app state changes", async () => {
        ;(
            BiometricsUtils.getDeviceEnrolledLevel as jest.Mock
        ).mockResolvedValue(SecurityLevelType.BIOMETRIC)
        ;(BiometricsUtils.getDeviceHasHardware as jest.Mock).mockResolvedValue(
            true,
        )
        ;(BiometricsUtils.getIsDeviceEnrolled as jest.Mock).mockResolvedValue(
            true,
        )
        ;(
            BiometricsUtils.getBiometricTypeAvailable as jest.Mock
        ).mockResolvedValue("touch")

        const mockUseAppState = jest.fn(() => {
            return {
                previousState: AppStateType.ACTIVE,
                currentState: AppStateType.INACTIVE,
            }
        })

        const { result, waitForNextUpdate } = renderHook(() => useBiometrics())

        expect(result.current).toEqual({})

        mockUseAppState.mockReturnValue({
            previousState: AppStateType.ACTIVE,
            currentState: AppStateType.ACTIVE,
        })
        await waitForNextUpdate({ timeout: 5000 })

        expect(result.current).toEqual({
            currentSecurityLevel: SecurityLevelType.BIOMETRIC,
            authTypeAvailable: "touch",
            isDeviceEnrolled: true,
            isHardwareAvailable: true,
            accessControl: true,
        })
    })
})
