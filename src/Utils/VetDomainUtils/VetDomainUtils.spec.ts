import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { getAvatar, getVetDomainsRegistryAddress } from "./VetDomainUtils"
import { ethers } from "ethers"
import { ThorClient } from "@vechain/sdk-network"

const thorMocker = (overrides: { resolver: string[]; text: string[] }): ThorClient => {
    return {
        contracts: {
            load: () => ({
                read: {
                    resolver: () => Promise.resolve(overrides.resolver),
                    text: () => Promise.resolve(overrides.text),
                },
            }),
        },
    } as any
}

describe("VetDomainUtils", () => {
    describe("getVetDomainsRegistryAddress", () => {
        it("should return a valid value for valid networks", () => {
            expect(getVetDomainsRegistryAddress(defaultMainNetwork.genesis.id)).toBeDefined()
            expect(getVetDomainsRegistryAddress(defaultTestNetwork.genesis.id)).toBeDefined()
        })
        it("should return null for invalid networks", () => {
            expect(getVetDomainsRegistryAddress(defaultMainNetwork.genesis.id + "1")).toBeNull()
        })
    })

    describe("getAvatar", () => {
        it("should return null if the domain is not defined", async () => {
            await expect(
                getAvatar("", { vetDomainsAddress: "0x0", genesisId: "0x0", thor: {} as any }),
            ).resolves.toBeNull()
        })
        it("should throw an error if the domain is an address", async () => {
            await expect(
                getAvatar(ethers.constants.AddressZero, {
                    vetDomainsAddress: "0x0",
                    genesisId: "0x0",
                    thor: {} as any,
                }),
            ).rejects.toThrow("getAvatar expects a domain name, not an address")
        })
        it("should return null if the resolver is either not defined or the zero address", async () => {
            await expect(
                getAvatar("test.vet", {
                    vetDomainsAddress: "0x0",
                    genesisId: "0x0",
                    thor: thorMocker({ resolver: [], text: [] }),
                }),
            ).resolves.toBeNull()
            await expect(
                getAvatar("test.vet", {
                    vetDomainsAddress: "0x0",
                    genesisId: "0x0",
                    thor: thorMocker({ resolver: [ethers.constants.AddressZero], text: [] }),
                }),
            ).resolves.toBeNull()
        })
        it("should return null if there is no avatar txt record", async () => {
            await expect(
                getAvatar("test.vet", {
                    vetDomainsAddress: "0x0",
                    genesisId: "0x0",
                    thor: thorMocker({ resolver: [ethers.Wallet.createRandom().address], text: [] }),
                }),
            ).resolves.toBeNull()
        })
        it("should return the avatar record if present", async () => {
            await expect(
                getAvatar("test.vet", {
                    vetDomainsAddress: "0x0",
                    genesisId: "0x0",
                    thor: thorMocker({
                        resolver: [ethers.Wallet.createRandom().address],
                        text: ["https://vechain.org"],
                    }),
                }),
            ).resolves.toBe("https://vechain.org")
        })
        it("should return null if an error occurs", async () => {
            await expect(
                getAvatar("test.vet", {
                    vetDomainsAddress: "0x0",
                    genesisId: "0x0",
                    thor: {
                        contracts: {
                            load: () => {
                                throw new Error("MOCK_ERROR")
                            },
                        },
                    } as any,
                }),
            ).resolves.toBeNull()
        })
    })
})
