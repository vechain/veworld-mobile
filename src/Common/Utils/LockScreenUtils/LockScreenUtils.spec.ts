import { WalletSecurity } from "~Common/Hooks"
import { WALLET_STATUS } from "~Model"
import { isBiometricLockFlow, isLockScreenFlow } from "./LockScreenUtils"

describe("isLockScreenFlow", () => {
    it("should return false", () => {
        expect(
            isLockScreenFlow(WALLET_STATUS.LOCKED, WalletSecurity.PASS_UNLOCK),
        ).toEqual(true)
    })
    it("should return false if appLockStatus not equal to LOCKED", () => {
        expect(
            isLockScreenFlow(
                WALLET_STATUS.FIRST_TIME_ACCESS,
                WalletSecurity.PASS_UNLOCK,
            ),
        ).toEqual(false)
    })
    it("should return false if walletSecurity not equal to PASS_UNLOCK", () => {
        expect(
            isLockScreenFlow(WALLET_STATUS.LOCKED, WalletSecurity.NONE),
        ).toEqual(false)
    })
})

describe("isBiometricLockFlow", () => {
    it("should return false", () => {
        expect(
            isBiometricLockFlow(
                WALLET_STATUS.LOCKED,
                WalletSecurity.BIO_UNLOCK,
            ),
        ).toEqual(true)
    })
    it("should return false if appLockStatus not equal to LOCKED", () => {
        expect(
            isBiometricLockFlow(
                WALLET_STATUS.FIRST_TIME_ACCESS,
                WalletSecurity.BIO_UNLOCK,
            ),
        ).toEqual(false)
    })
    it("should return false if walletSecurity not equal to BIO_UNLOCK", () => {
        expect(
            isBiometricLockFlow(
                WALLET_STATUS.LOCKED,
                WalletSecurity.PASS_UNLOCK,
            ),
        ).toEqual(false)
    })
})
