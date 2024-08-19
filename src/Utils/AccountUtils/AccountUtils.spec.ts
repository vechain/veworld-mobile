import { TestHelpers } from "~Test"
import AccountUtils from "./index"

const accounts = [TestHelpers.data.account1D1, TestHelpers.data.account2D1]

describe("AccountUtils", () => {
    it("nextAlias - should return the next alias", () => {
        expect(AccountUtils.nextAlias(1)).toEqual("Account 1")
    })

    it("getNextIndex - should return the next index", () => {
        expect(AccountUtils.getNextIndex(accounts)).toEqual(2)
    })

    it("getAccountForIndex - should return the correct account", () => {
        expect(AccountUtils.getAccountForIndex(0, TestHelpers.data.device1, 0)).toEqual(TestHelpers.data.account1D1)
    })

    it("getAccountForIndex - should throw when no xPub", () => {
        expect(() =>
            AccountUtils.getAccountForIndex(0, { ...TestHelpers.data.device1, xPub: undefined }, 0),
        ).toThrowError("The XPub can't be null for HD devices")
    })

    it("isObservedAccount - should return true", () => {
        expect(AccountUtils.isObservedAccount(TestHelpers.data.account5D1Observed)).toBe(true)
    })

    it("isObservedAccount - should return false", () => {
        expect(AccountUtils.isObservedAccount(TestHelpers.data.account4D1)).toBe(false)
    })
})
