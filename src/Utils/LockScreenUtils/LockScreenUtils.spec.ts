import {
    isBiometricLockFlow,
    isLockScreenFlow,
    isHideSplash,
} from "./LockScreenUtils"

describe("isLockScreenFlow", () => {
    it("should return false if isWalletSecurityPassword is false", () => {
        expect(isLockScreenFlow(true, false)).toEqual(false)
    })

    it("should return true if appLockStatusInactive is true and isWalletSecurityPassword is true", () => {
        expect(isLockScreenFlow(true, true)).toEqual(true)
    })
})

describe("isBiometricLockFlow", () => {
    it("should return false if appLockStatusInactive is false", () => {
        expect(isBiometricLockFlow(false, true)).toEqual(false)
    })
    it("should return true if appLockStatusInactive is true and isWalletSecurityBiometrics is true", () => {
        expect(isBiometricLockFlow(true, true)).toEqual(true)
    })
})

describe("isHideSplash", () => {
    it("should return false if both appLockStatusInactive and isWalletSecurityBiometrics are true", () => {
        expect(isHideSplash(false, false)).toEqual(false)
    })
    it("should return true if either appLockStatusInactive or isWalletSecurityBiometrics are true", () => {
        expect(isHideSplash(true, false)).toEqual(true)
    })
})
