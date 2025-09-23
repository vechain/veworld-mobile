import { TestHelpers } from "~Test"
import AccountUtils from "./index"
import { Vns } from "~Hooks"
import { Contact, ContactType, WalletAccount } from "~Model"

const accounts = [TestHelpers.data.account1D1, TestHelpers.data.account2D1]
const contact1 = TestHelpers.data.getContact(0, ContactType.KNOWN)

const vnsData: Vns[] = [
    { name: "test-dev.vet", address: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa" },
    {
        name: "doublemme.vet",
        address: contact1.address,
    },
]

const withLogging = <TResult>(testName: string, resultFn: () => TResult, cb: (result: TResult) => void) => {
    console.log(`${testName} - init`)
    const result = resultFn()
    console.log(`${testName} - result`)
    cb(result)
    console.log(`${testName} - asserted`)
}

describe("AccountUtils", () => {
    it("nextAlias - should return the next alias", () => {
        withLogging(
            expect.getState().currentTestName ?? "DEBUG_TEST",
            () => AccountUtils.nextAlias(1, "Device"),
            r => expect(r).toEqual("Device 1"),
        )
    })

    it("getNextIndex - should return the next index", () => {
        withLogging(
            expect.getState().currentTestName ?? "DEBUG_TEST",
            () => AccountUtils.getNextIndex(accounts),
            r => expect(r).toEqual(2),
        )
    })

    it("getAccountForIndex - should return the correct account", () => {
        withLogging(
            expect.getState().currentTestName ?? "DEBUG_TEST",
            () => AccountUtils.getAccountForIndex(0, TestHelpers.data.device1, 0),
            r => expect(r).toEqual(TestHelpers.data.account1D1),
        )
    })

    it("getAccountForIndex - should throw when no xPub", () => {
        console.log(`${expect.getState().currentTestName ?? "DEBUG_TEST"} - init`)
        expect(() => AccountUtils.getAccountForIndex(0, { ...TestHelpers.data.device1, xPub: undefined }, 0)).toThrow(
            "The XPub can't be null for HD devices",
        )
        console.log(`${expect.getState().currentTestName ?? "DEBUG_TEST"} - asserted`)
    })

    it("updateAccountVns - should return an account with the vnsName property", () => {
        const account = AccountUtils.updateAccountVns(TestHelpers.data.account1D1, vnsData) as WalletAccount
        expect(account.vnsName).toBe("test-dev.vet")
    })

    it("updateAccountVns - should return a contact with the vnsName property", () => {
        const contact = AccountUtils.updateAccountVns(contact1, vnsData) as Contact
        expect(contact.vnsName).toBe("doublemme.vet")
    })

    it("updateAccountVns - should return undefined if no address found in vnsData", () => {
        const contact = AccountUtils.updateAccountVns(TestHelpers.data.account2D1, vnsData) as WalletAccount
        expect(contact.vnsName).toBeUndefined()
    })

    it("isObservedAccount - should return true", () => {
        expect(AccountUtils.isObservedAccount(TestHelpers.data.account5D1Observed)).toBe(true)
    })

    it("isObservedAccount - should return false", () => {
        expect(AccountUtils.isObservedAccount(TestHelpers.data.account4D1)).toBe(false)
    })
})
