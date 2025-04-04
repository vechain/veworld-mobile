/* eslint-disable max-len */
/* eslint-disable no-console */
import { HDNode, mnemonic } from "thor-devkit"
import { XPub } from "~Model/Crypto"
import {
    coinbaseQRcodeAddress,
    compareAddresses,
    compareListOfAddresses,
    ExplorerLinkType,
    getAddressFromHdNode,
    getAddressFromXPub,
    getExplorerLink,
    humanAddress,
    isValid,
    isVechainToken,
    leftPadWithZeros,
    loadVnsFromCache,
    regexPattern,
    showAddressOrName,
} from "./AddressUtils"
import { queryClient } from "~Api/QueryProvider"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"

const mainNetwork = defaultMainNetwork
const testNetwork = defaultTestNetwork

process.env.REACT_APP_EXPLORER_MAIN_URL = mainNetwork.explorerUrl
process.env.REACT_APP_EXPLORER_TESTNET_URL = testNetwork.explorerUrl

const validMnemonicPhrase = [
    "denial",
    "kitchen",
    "pet",
    "squirrel",
    "other",
    "broom",
    "bar",
    "gas",
    "better",
    "priority",
    "spoil",
    "cross",
]

const validXPub: XPub = {
    publicKey:
        "04705f631be98f5e982167438af4ec9bb1ada05af19ebbe0d5fba4b2152274fc6e7a8607b4e5f8d03b2d31fe67e3563d2f688fac7fda8916db18a05a9b7846e9fe",
    chainCode: "bd161611b74b0216f306c5b9adfcf2d9202e20604ed39936e437f3add301b1f1",
}

const address1 = "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"
const address1NoHex = "f077b491b355E64048cE21E3A6Fc4751eEeA77fa"
const address2 = "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68"

const invalidXPub: XPub = {
    publicKey: "854754389759",
    chainCode: "84747",
}

jest.mock("~Api/QueryProvider", () => ({
    ...jest.requireActual("~Api/QueryProvider"),
    queryClient: {
        getQueryData: jest.fn().mockReturnValue(undefined),
    },
}))

describe("getAddressFromXPub - positive tests", () => {
    test("valid XPub - address1", () => {
        expect(getAddressFromXPub(validXPub, 0)).toBe(address1)
    })
    test("valid XPub - address2", () => {
        expect(getAddressFromXPub(validXPub, 1)).toBe(address2)
    })
})

describe("getAddressFromXPub - negative tests", () => {
    const originalError = console.error
    beforeAll(() => {
        // mute the errors in the console
        console.error = jest.fn()
    })
    afterAll(() => {
        // unmute the errors
        console.error = originalError
    })
    test("invalid XPub", () => {
        expect(() => {
            getAddressFromXPub(invalidXPub, 0)
        }).toThrow()
    })
})

describe("getAddressFromHdNode - positive tests", () => {
    test("valid mnemonic phrase - address1", () => {
        const hdNode = HDNode.fromMnemonic(validMnemonicPhrase)
        expect(getAddressFromHdNode(hdNode, 0)).toBe(address1)
    })
    test("valid mnemonic phrase - address2", () => {
        const hdNode = HDNode.fromMnemonic(validMnemonicPhrase)
        expect(getAddressFromHdNode(hdNode, 1)).toBe(address2)
    })
    test("it should throw", () => {
        expect(() => {
            getAddressFromHdNode({} as HDNode, 0)
        }).toThrow("Invalid XPub")
    })
})

describe("compareAddresses - positive testing", () => {
    test("regular addresses - same", () => {
        expect(compareAddresses(address1, address1)).toBe(true)
    })

    test("regular addresses - different", () => {
        expect(compareAddresses(address1, address2)).toBe(false)
    })

    test("1 uppercase, 1 lowercase", () => {
        expect(compareAddresses(address1.toLowerCase(), address1.toUpperCase())).toBe(true)
    })

    test("both uppercase", () => {
        expect(compareAddresses(address1.toUpperCase(), address1.toUpperCase())).toBe(true)
    })

    test("both lowercase", () => {
        expect(compareAddresses(address1.toLowerCase(), address1.toLowerCase())).toBe(true)
    })

    test("generated node", () => {
        const hdNode = HDNode.fromMnemonic(mnemonic.generate())
        const rootAddress = hdNode.address

        expect(compareAddresses(rootAddress, rootAddress)).toBe(true)

        expect(compareAddresses(rootAddress, rootAddress.toUpperCase())).toBe(true)

        expect(compareAddresses(rootAddress, rootAddress.toUpperCase())).toBe(true)
    })
})

describe("compareAddresses - negative testing", () => {
    test("1 address, 1 not hex", () => {
        expect(compareAddresses(address1, "not hex")).toBe(false)
    })

    test("bad length", () => {
        expect(compareAddresses(address1.slice(0, 10), address1.slice(0, 10))).toBe(true)
    })

    test("equal strings - neither addresses", () => {
        expect(compareAddresses("VET", "VET")).toBe(true)
    })

    test("one address no hex", () => {
        expect(compareAddresses(address1, address1NoHex)).toBe(true)
    })

    test("no addresses provided", () => {
        expect(compareAddresses()).toBe(false)
    })
})

describe("compareListOfAddresses - positive testing", () => {
    test("same list", () => {
        expect(compareListOfAddresses([address1, address2], [address1, address2])).toBe(true)
    })

    test("same list, different order", () => {
        expect(compareListOfAddresses([address1, address2], [address2, address1])).toBe(true)
    })

    test("same list, different case", () => {
        expect(
            compareListOfAddresses(
                [address1.toLowerCase(), address2.toUpperCase()],
                [address2.toLowerCase(), address1.toUpperCase()],
            ),
        ).toBe(true)
    })
})

describe("compareListOfAddresses - negative testing", () => {
    test("different lists", () => {
        expect(compareListOfAddresses([address1, address2], [address1, address1])).toBe(false)
    })

    test("different lists, different order", () => {
        expect(compareListOfAddresses([address1, address2], [address2, address2])).toBe(false)
    })

    test("different lists, different case", () => {
        expect(
            compareListOfAddresses(
                [address1.toLowerCase(), address2.toUpperCase()],
                [address2.toLowerCase(), address2.toUpperCase()],
            ),
        ).toBe(false)
    })

    test("first list empty", () => {
        expect(compareListOfAddresses([], [address1, address2])).toBe(false)
    })

    test("second list empty", () => {
        expect(compareListOfAddresses([address1, address2], [])).toBe(false)
    })
})

describe("Is Valid Address", () => {
    test("valid address", () => {
        expect(isValid("0x0000000000000000000000000000456e65726779")).toBe(true)
    })
    test("No prefix", () => {
        expect(isValid("0000000000000000000000000000456e65726779")).toBe(true)
    })
    test("invalid length hex", () => {
        expect(isValid("0x0000000000000000000000000000456e6572677")).toBe(false)
    })
    test("Invalid prefix", () => {
        expect(isValid("1x0000000000000000000000000000456e65726779")).toBe(false)
    })
    test("Not Hex", () => {
        expect(isValid("0x0000000000000000000000000000456e6572677g")).toBe(false)
    })

    test("not a string", () => {
        // @ts-ignore
        expect(isValid(1234)).toBe(false)
    })
})

describe("regexPattern", () => {
    test("returns the correct result", () => {
        expect(regexPattern()).toStrictEqual(/^0x[a-fA-F0-9]{40}$/)
    })
})

describe("Check vechain address", () => {
    test("Invalid vechain address must return false", () => {
        expect(isVechainToken("vet")).toBe(false)
    })

    test("Valid vechain thor token address must return true", () => {
        expect(isVechainToken("0x0000000000000000000000000000456e65726779")).toBe(true)
    })

    test("Invalid vechain thor token address must return false", () => {
        expect(isVechainToken("invalid-address")).toBe(false)
    })

    test("Should add correct padding to address", () => {
        expect(leftPadWithZeros(address1, 64)).toBe("0x000000000000000000000000" + address1NoHex)
    })

    test("should add correct padding to no hex address", () => {
        expect(leftPadWithZeros(address1NoHex, 64)).toBe("0x000000000000000000000000" + address1NoHex)
    })

    test("left pad with too many zeros", () => {
        expect(() => {
            leftPadWithZeros(address1, 5)
        }).toThrow()
    })
})

describe("getExplorerLink", () => {
    it("MAINNET - should return accounts", () => {
        expect(getExplorerLink(mainNetwork, ExplorerLinkType.ACCOUNT)).toBe("https://vechainstats.com/accounts")
    })

    it("MAINNET - should return transfers", () => {
        expect(getExplorerLink(mainNetwork, ExplorerLinkType.TRANSACTION)).toBe("https://vechainstats.com/transactions")
    })

    it("TESTNET - should return accounts", () => {
        expect(getExplorerLink(testNetwork, ExplorerLinkType.ACCOUNT)).toBe(
            "https://explore-testnet.vechain.org/accounts",
        )
    })

    it("TESTNET - should return transfers", () => {
        expect(getExplorerLink(testNetwork, ExplorerLinkType.TRANSACTION)).toBe(
            "https://explore-testnet.vechain.org/transactions",
        )
    })
})

describe("humanAddress", () => {
    it("should return correctly", () => {
        expect(humanAddress("0x4fec365ab34c21784b05e3fed80633268e6457ff")).toBe("0x4fec…57ff")
    })
})

describe("showAddressOrName", () => {
    it("should return the VNS name if vnsData have both name and address", () => {
        const addressOrName = showAddressOrName(address1, {
            name: "test-dev.vet",
            address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        })

        expect(addressOrName).toBe("test-dev.vet")
    })

    it("should return the address when vnsData only have the address", () => {
        const addressOrName = showAddressOrName(address2, { address: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68" })

        expect(addressOrName).toBe("0x435933c8064b4Ae76bE665428e0307eF2cCFBD68")
    })

    it("should return the address when no vnsData provided", () => {
        const addressOrName = showAddressOrName(address1, {})

        expect(addressOrName).toBe("0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa")
    })

    it("should return the address formatted if format options are provided", () => {
        const addressOrName = showAddressOrName(address1, {}, { ellipsed: true, lengthBefore: 4, lengthAfter: 6 })

        expect(addressOrName).toBe("0xf0…eA77fa")
    })
})

describe("loadVnsFromCache", () => {
    it("should return undefined if there isn't data on the cache", () => {
        ;(queryClient.getQueryData as jest.Mock<{ name: string; address: string }[] | undefined>).mockReturnValue(
            undefined,
        )
        const vnsData = loadVnsFromCache(address1, defaultTestNetwork)

        expect(vnsData).toBeUndefined()
    })

    it("should return the VNS name if data on cache and name exists", () => {
        ;(queryClient.getQueryData as jest.Mock<{ name: string; address: string }[] | undefined>).mockReturnValue([
            { name: "test-dev.vet", address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa" },
            { name: "", address: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68" },
        ])
        const vnsData = loadVnsFromCache(address1, defaultTestNetwork)

        expect(vnsData).not.toBeUndefined()
        expect(vnsData).toMatchObject({ name: "test-dev.vet", address: address1 })
    })

    it("should return the VNS name if data on cache and name exists when vns provided as address", () => {
        ;(queryClient.getQueryData as jest.Mock<{ name: string; address: string }[] | undefined>).mockReturnValue([
            { name: "test-dev.vet", address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa" },
            { name: "", address: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68" },
        ])
        const vnsData = loadVnsFromCache("test-dev.vet", defaultTestNetwork)

        expect(vnsData).not.toBeUndefined()
        expect(vnsData).toMatchObject({ name: "test-dev.vet", address: address1 })
    })

    it("should return the address if data on cache doesn't have name", () => {
        ;(queryClient.getQueryData as jest.Mock<{ name: string; address: string }[] | undefined>).mockReturnValue([
            { name: "test-dev.vet", address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa" },
            { name: "", address: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68" },
        ])
        const vnsData = loadVnsFromCache(address2, defaultTestNetwork)

        expect(vnsData).not.toBeUndefined()
        expect(vnsData).toMatchObject({ name: "", address: address2 })
    })
})

describe("coinbaseQRcodeAddress", () => {
    it("should remove the 'vechain:' prefix correctly", () => {
        expect(coinbaseQRcodeAddress("vechain:0x4fec365ab34c21784b05e3fed80633268e6457ff")).toBe(
            "0x4fec365ab34c21784b05e3fed80633268e6457ff",
        )
    })

    it("should return the address correctly", () => {
        expect(coinbaseQRcodeAddress("0x4fec365ab34c21784b05e3fed80633268e6457ff")).toBe(
            "0x4fec365ab34c21784b05e3fed80633268e6457ff",
        )
    })
})
