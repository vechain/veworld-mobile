import { TestHelpers } from "~Test"
import { Contact, ContactType, WalletAccount } from "~Model"
import { getAccountForIndex, getNextIndex, isObservedAccount, nextAlias, updateAccountVns } from "./AccountUtils"
import { Vns } from "~Model/Vns"

const { account1D1, account2D1, getContact, device1, account5D1Observed, account4D1 } = TestHelpers.data

const accounts = [account1D1, account2D1]
const contact1 = getContact(0, ContactType.KNOWN)

const vnsData: Vns[] = [
    { name: "test-dev.vet", address: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa" },
    {
        name: "doublemme.vet",
        address: contact1.address,
    },
]

describe("AccountUtils", () => {
    it("nextAlias - should return the next alias", () => {
        expect(nextAlias(1, "Device")).toEqual("Device 1")
    })

    it("getNextIndex - should return the next index", () => {
        expect(getNextIndex(accounts)).toEqual(2)
    })

    it("getAccountForIndex - should throw when no xPub", () => {
        expect(() => getAccountForIndex(0, { ...device1, xPub: undefined }, 0)).toThrow(
            "The XPub can't be null for HD devices",
        )
    })

    it("updateAccountVns - should return an account with the vnsName property", () => {
        const account = updateAccountVns(account1D1, vnsData) as WalletAccount
        expect(account.vnsName).toBe("test-dev.vet")
    })

    it("updateAccountVns - should return a contact with the vnsName property", () => {
        const contact = updateAccountVns(contact1, vnsData) as Contact
        expect(contact.vnsName).toBe("doublemme.vet")
    })

    it("updateAccountVns - should return undefined if no address found in vnsData", () => {
        const contact = updateAccountVns(account2D1, vnsData) as WalletAccount
        expect(contact.vnsName).toBeUndefined()
    })

    it("isObservedAccount - should return true", () => {
        expect(isObservedAccount(account5D1Observed)).toBe(true)
    })

    it("isObservedAccount - should return false", () => {
        expect(isObservedAccount(account4D1)).toBe(false)
    })
})
