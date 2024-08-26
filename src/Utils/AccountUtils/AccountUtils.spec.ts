import { TestHelpers } from "~Test"
import AccountUtils from "./index"
import { updateAccountVns } from "./AccountUtils"
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

    it("updateAccountVns - should return an account with the vnsName property", () => {
        const account = updateAccountVns(TestHelpers.data.account1D1, vnsData) as WalletAccount
        expect(account.vnsName).toBe("test-dev.vet")
    })

    it("updateAccountVns - should return a contact with the vnsName property", () => {
        const contact = updateAccountVns(contact1, vnsData) as Contact
        expect(contact.vnsName).toBe("doublemme.vet")
    })

    it("updateAccountVns - should return undefined if no address found in vnsData", () => {
        const contact = updateAccountVns(TestHelpers.data.account2D1, vnsData) as WalletAccount
        expect(contact.vnsName).toBeUndefined()
    })
})
