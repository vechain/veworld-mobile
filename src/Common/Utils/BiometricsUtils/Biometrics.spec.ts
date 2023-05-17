import * as LocalAuthentication from "expo-local-authentication"
import { AuthenticationType, SecurityLevelType, WALLET_STATUS } from "~Model"
import PlatformUtils from "../PlatformUtils"
import {
    getDeviceEnrolledLevel,
    getDeviceHasHardware,
    getIsDeviceEnrolled,
    getBiometricTypeAvailable,
    authenticateWithBiometrics,
    isSecurityDowngrade,
    isSecurityUpgrade,
} from "./Biometrics"

jest.mock("../PlatformUtils")

describe("authentication functions", () => {
    describe("getDeviceEnrolledLevel", () => {
        it("should return the enrolled security level of the device", async () => {
            const mockLevel = LocalAuthentication.SecurityLevel.BIOMETRIC

            jest.spyOn(
                LocalAuthentication,
                "getEnrolledLevelAsync",
            ).mockResolvedValueOnce(mockLevel)

            const result = await getDeviceEnrolledLevel()

            expect(result).toBe(SecurityLevelType.BIOMETRICS)
        })
    })

    describe("getDeviceHasHardware", () => {
        it("should return a boolean indicating whether the device has biometric hardware", async () => {
            const mockHasHardware = true

            jest.spyOn(
                LocalAuthentication,
                "hasHardwareAsync",
            ).mockResolvedValueOnce(mockHasHardware)

            const result = await getDeviceHasHardware()

            expect(result).toBe(mockHasHardware)
        })
    })

    describe("getIsDeviceEnrolled", () => {
        it("should return a boolean indicating whether the device has enrolled biometric data", async () => {
            const mockIsEnrolled = true
            jest.spyOn(
                LocalAuthentication,
                "isEnrolledAsync",
            ).mockResolvedValueOnce(mockIsEnrolled)

            const result = await getIsDeviceEnrolled()

            expect(result).toBe(true)
        })
    })

    describe("getBiometricTypeAvailable", () => {
        it("should return the available biometric authentication type on the device", async () => {
            const mockType = [
                LocalAuthentication.AuthenticationType.FINGERPRINT,
            ]

            jest.spyOn(
                LocalAuthentication,
                "supportedAuthenticationTypesAsync",
            ).mockResolvedValueOnce(mockType)

            const result = await getBiometricTypeAvailable()

            expect(result).toBe(AuthenticationType.FINGERPRINT)
        })
    })

    describe("authenticateWithBiometrics", () => {
        it("should authenticate the user with the biometric authentication type available on the device", async () => {
            const mockResult = { success: true, error: "" }

            jest.spyOn(
                LocalAuthentication,
                "authenticateAsync",
            ).mockResolvedValueOnce(mockResult)

            const result = await authenticateWithBiometrics()

            expect(result).toBe(mockResult)
            expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled()
        })

        it("should not pass promptMessage on Android", async () => {
            const mockResult = { success: true, error: "" }

            ;(PlatformUtils.isAndroid as jest.Mock).mockReturnValue(true)

            jest.spyOn(
                LocalAuthentication,
                "authenticateAsync",
            ).mockResolvedValueOnce(mockResult)

            const result = await authenticateWithBiometrics()
            expect(result).toBe(mockResult)
            expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled()
        })
    })
    describe("isSecurityDowngrade", () => {
        it("returns true when the old security level is biometric and the new security level is secret, and appLockStatusActive is true", () => {
            const oldLevel = SecurityLevelType.BIOMETRICS
            const newLevel: SecurityLevelType = SecurityLevelType.PASSWORD
            const userHasOnboarded = true
            const isAppLockActive = true
            const appLockStatusActive =
                WALLET_STATUS.LOCKED && userHasOnboarded && isAppLockActive

            const result = isSecurityDowngrade(
                oldLevel,
                newLevel,
                appLockStatusActive,
            )

            expect(result).toBe(true)
        })

        it("returns false when the old security level is secret, regardless of the new security level and wallet status", () => {
            const oldLevel = SecurityLevelType.PASSWORD
            const newLevel: SecurityLevelType = SecurityLevelType.BIOMETRICS
            const userHasOnboarded = true
            const isAppLockActive = true
            const appLockStatusActive =
                WALLET_STATUS.LOCKED && userHasOnboarded && isAppLockActive

            const result = isSecurityDowngrade(
                oldLevel,
                newLevel,
                appLockStatusActive,
            )

            expect(result).toBe(false)
        })

        it("returns false when the new security level is biometric, regardless of the old security level and wallet status", () => {
            const oldLevel = SecurityLevelType.PASSWORD
            const newLevel: SecurityLevelType = SecurityLevelType.BIOMETRICS
            const userHasOnboarded = true
            const isAppLockActive = true
            const appLockStatusActive =
                WALLET_STATUS.LOCKED && userHasOnboarded && isAppLockActive

            const result = isSecurityDowngrade(
                oldLevel,
                newLevel,
                appLockStatusActive,
            )

            expect(result).toBe(false)
        })

        it("returns false when the user hasn't onboarded, regardless of the old and new security levels", () => {
            const oldLevel = SecurityLevelType.PASSWORD
            const newLevel: SecurityLevelType = SecurityLevelType.NONE
            const userHasOnboarded = true
            const isAppLockActive = true
            const appLockStatusActive =
                WALLET_STATUS.LOCKED && !userHasOnboarded && isAppLockActive

            const result = isSecurityDowngrade(
                oldLevel,
                newLevel,
                appLockStatusActive,
            )

            expect(result).toBe(false)
        })
    })

    describe("isSecurityUpgrade", () => {
        it("returns true when the old security level is none and the new security level is biometric, and the wallet status is unlocked", () => {
            const oldLevel = SecurityLevelType.NONE
            const newLevel: SecurityLevelType = SecurityLevelType.BIOMETRICS
            const userHasOnboarded = true
            const isAppLockActive = true
            const appLockStatusActive =
                WALLET_STATUS.LOCKED && userHasOnboarded && isAppLockActive

            const result = isSecurityUpgrade(
                oldLevel,
                newLevel,
                appLockStatusActive,
            )

            expect(result).toBe(true)
        })

        it("returns false when the old security level is biometric, regardless of the new security level and wallet status", () => {
            const oldLevel = SecurityLevelType.BIOMETRICS
            const newLevel: SecurityLevelType = SecurityLevelType.PASSWORD
            const userHasOnboarded = true
            const isAppLockActive = true
            const appLockStatusActive =
                WALLET_STATUS.LOCKED && userHasOnboarded && isAppLockActive

            const result = isSecurityUpgrade(
                oldLevel,
                newLevel,
                appLockStatusActive,
            )

            expect(result).toBe(false)
        })

        it("returns false when the new security level is secret, regardless of the old security level and wallet status", () => {
            const oldLevel = SecurityLevelType.PASSWORD
            const newLevel: SecurityLevelType = SecurityLevelType.NONE
            const userHasOnboarded = true
            const isAppLockActive = true
            const appLockStatusActive =
                WALLET_STATUS.LOCKED && userHasOnboarded && isAppLockActive

            const result = isSecurityUpgrade(
                oldLevel,
                newLevel,
                appLockStatusActive,
            )

            expect(result).toBe(false)
        })
    })
})
