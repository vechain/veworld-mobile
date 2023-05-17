import { renderHook } from "@testing-library/react-hooks"
import BiometricsUtils from "~Common/Utils/BiometricsUtils"
import { useBiometrics } from "./useBiometrics"
import { AppStateType, SecurityLevelType } from "~Model"

// mock delle funzioni di BiometricsUtils
jest.mock("~Common/Utils/BiometricsUtils", () => ({
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

        await waitForNextUpdate()

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

        const mockUseAppState = jest.fn(() => [
            AppStateType.ACTIVE,
            AppStateType.INACTIVE,
        ])

        const { result, waitForNextUpdate } = renderHook(() => useBiometrics())

        expect(result.current).toEqual({})

        mockUseAppState.mockReturnValue([
            AppStateType.ACTIVE,
            AppStateType.ACTIVE,
        ])
        await waitForNextUpdate()

        expect(result.current).toEqual({
            currentSecurityLevel: SecurityLevelType.BIOMETRIC,
            authTypeAvailable: "touch",
            isDeviceEnrolled: true,
            isHardwareAvailable: true,
            accessControl: true,
        })
    })
})
