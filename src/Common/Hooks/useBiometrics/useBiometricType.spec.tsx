import { renderHook } from "@testing-library/react-hooks"
import { useBiometricType } from "./useBiometricType"
import { TestWrapper, setPlatform } from "~Test"
import { waitFor } from "@testing-library/react-native"
import { AuthenticationType, SecurityLevelType } from "~Model"
import { useBiometrics } from "./useBiometrics"

jest.mock("./useBiometrics", () => ({
    useBiometrics: jest.fn(() => SecurityLevelType.NONE),
}))

describe("useBiometricType", () => {
    it("should returns Biometrics", async () => {
        const { result } = renderHook(() => useBiometricType(), {
            wrapper: TestWrapper,
        })
        await waitFor(() => {
            return expect(result.current).toBeTruthy()
        })
        expect(result.current.currentSecurityLevel).toEqual("Biometrics")
    })
    it("should returns Face ID", async () => {
        ;(useBiometrics as jest.Mock).mockReturnValueOnce({
            currentSecurityLevel: SecurityLevelType.BIOMETRIC,
            authtypeAvailable: AuthenticationType.FACIAL_RECOGNITION,
        })
        const { result } = renderHook(() => useBiometricType(), {
            wrapper: TestWrapper,
        })
        await waitFor(() => {
            return expect(result.current).toBeTruthy()
        })
        expect(result.current.currentSecurityLevel).toEqual("Face ID")
    })
    it("should returns Touch ID", async () => {
        ;(useBiometrics as jest.Mock).mockReturnValueOnce({
            currentSecurityLevel: SecurityLevelType.BIOMETRIC,
            authtypeAvailable: AuthenticationType.FINGERPRINT,
        })
        const { result } = renderHook(() => useBiometricType(), {
            wrapper: TestWrapper,
        })
        await waitFor(() => {
            return expect(result.current).toBeTruthy()
        })
        expect(result.current.currentSecurityLevel).toEqual("Touch ID")
    })
    it("should returns FingerPrint when android", async () => {
        setPlatform("android")
        ;(useBiometrics as jest.Mock).mockReturnValueOnce({
            currentSecurityLevel: SecurityLevelType.BIOMETRIC,
            authtypeAvailable: AuthenticationType.FINGERPRINT,
        })
        const { result } = renderHook(() => useBiometricType(), {
            wrapper: TestWrapper,
        })
        await waitFor(() => {
            return expect(result.current).toBeTruthy()
        })
        expect(result.current.currentSecurityLevel).toEqual("Fingerprint")
    })
})
