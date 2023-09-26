import {
    isBiometricCanceled,
    isBiometricTooManyAttempts,
} from "./BiometricErrors"

describe("isBiometricCanceled", () => {
    it("should return true when error is a custom Error object with iOS cancel message", () => {
        const error = { code: "-128" }
        expect(isBiometricCanceled(error)).toBe(true)
    })

    it("should return true when error is a custom Error object with Android cancel code", () => {
        const error = { code: "13" }
        expect(isBiometricCanceled(error)).toBe(true)
    })

    it("should return false when error is not a custom Error object", () => {
        const error = "User canceled"
        expect(isBiometricCanceled(error as any)).toBe(false)
    })

    it("should return false when error is a custom Error object with a different message", () => {
        const error = { code: "SomeOtherMessage" }
        expect(isBiometricCanceled(error)).toBe(false)
    })
})

describe("isBiometricTooManyAttempts", () => {
    it("should return true when error is a custom Error object with Android too many attempts code", () => {
        const error = { code: "7" }
        expect(isBiometricTooManyAttempts(error)).toBe(true)
    })

    it("should return true when error is a custom Error object with Android disabled sensor code", () => {
        const error = { code: "9" }
        expect(isBiometricTooManyAttempts(error)).toBe(true)
    })

    it("should return false when error is not a custom Error object", () => {
        const error = "User canceled"
        expect(isBiometricTooManyAttempts(error as any)).toBe(false)
    })

    it("should return false when error is a custom Error object with a different message", () => {
        const error = { code: "SomeOtherMessage" }
        expect(isBiometricTooManyAttempts(error)).toBe(false)
    })
})
