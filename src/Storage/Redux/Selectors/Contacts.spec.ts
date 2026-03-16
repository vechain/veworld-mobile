import { ethers } from "ethers"
import { defaultMainNetwork } from "~Constants"

import { selectSelectedAccountAddress } from "./Account"

import { selectKnownContacts, selectRecentContacts } from "./Contacts"

jest.mock("./Account", () => ({
    selectSelectedAccountAddress: jest.fn(),
    selectSelectedAccountOrNull: jest.fn(),
    selectSelectedAccount: jest.fn(),
}))

jest.mock("./Network", () => ({
    selectSelectedNetwork: jest.fn().mockReturnValue(defaultMainNetwork),
}))

describe("Contacts - Selectors", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("selectKnownContacts", () => {
        it("should return known contacts sorted alphabetically by alias", () => {
            const state = {
                contacts: {
                    contacts: [
                        { alias: "zeta", address: ethers.Wallet.createRandom().address, type: "known" },
                        { alias: "Alpha", address: ethers.Wallet.createRandom().address, type: "known" },
                        { alias: "bravo", address: ethers.Wallet.createRandom().address, type: "known" },
                        { alias: "cache", address: ethers.Wallet.createRandom().address, type: "cache" },
                    ],
                    recentContacts: {},
                },
            }

            const result = selectKnownContacts(state as any)

            expect(result.map(contact => contact.alias)).toEqual(["Alpha", "bravo", "zeta"])
        })
    })

    describe("selectRecentContacts", () => {
        it("should not sort in place", () => {
            const address = ethers.Wallet.createRandom().address
            ;(selectSelectedAccountAddress as unknown as jest.Mock).mockReturnValue(address.toLowerCase())

            const state = {
                contacts: {
                    contacts: [],
                    recentContacts: {
                        [defaultMainNetwork.genesis.id]: {
                            [address.toLowerCase()]: [
                                { address: ethers.Wallet.createRandom().address, timestamp: 0 },
                                { address: ethers.Wallet.createRandom().address, timestamp: 1 },
                            ],
                        },
                    },
                },
            }

            const result = selectRecentContacts(state as any)

            expect(result).toHaveLength(2)
            expect(result[0].timestamp).toBe(1)
            expect(result[1].timestamp).toBe(0)

            expect(
                state.contacts.recentContacts[defaultMainNetwork.genesis.id][address.toLowerCase()][0].timestamp,
            ).toBe(0)
            expect(
                state.contacts.recentContacts[defaultMainNetwork.genesis.id][address.toLowerCase()][1].timestamp,
            ).toBe(1)
        })
    })
})
