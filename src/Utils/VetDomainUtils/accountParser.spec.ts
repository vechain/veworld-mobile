import { ThorClient } from "@vechain/sdk-network"
import { getCollectibleMetadataOptions } from "~Hooks/useCollectibleMetadata"
import { getCachedTokenURI } from "~Networking/NFT/getTokenURI"

import { parseAvatarRecord } from "./accountParser"

jest.mock("~Hooks/useCollectibleMetadata", () => ({
    getCollectibleMetadataOptions: jest.fn(),
}))

jest.mock("~Networking/NFT/getTokenURI", () => ({
    getCachedTokenURI: jest.fn(),
}))

const thorMocker = (overrides: { erc1155Uri: string[] }): ThorClient => {
    return {
        contracts: {
            load: () => ({
                read: {
                    uri: () => Promise.resolve(overrides.erc1155Uri),
                },
            }),
        },
    } as any
}

describe("accountParser", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    describe("parseAvatarRecord", () => {
        it("should return the record if it is either https, ipfs or arweave", async () => {
            await expect(() =>
                parseAvatarRecord("https://vechain.org", { genesisId: "0x0", thor: {} as any }),
            ).resolves.toBe("https://vechain.org")
            await expect(() =>
                parseAvatarRecord("ipfs://bafybeieaqrkywsnmssc3cqehwj6li65oop2eymt6ph6cucmw6yf3ajwr7u", {
                    genesisId: "0x0",
                    thor: {} as any,
                }),
            ).resolves.toBe("ipfs://bafybeieaqrkywsnmssc3cqehwj6li65oop2eymt6ph6cucmw6yf3ajwr7u")
            await expect(() =>
                parseAvatarRecord("ar://bafybeieaqrkywsnmssc3cqehwj6li65oop2eymt6ph6cucmw6yf3ajwr7u", {
                    genesisId: "0x0",
                    thor: {} as any,
                }),
            ).resolves.toBe("ar://bafybeieaqrkywsnmssc3cqehwj6li65oop2eymt6ph6cucmw6yf3ajwr7u")
        })

        it("should return null if it doesn't match anything", async () => {
            await expect(() =>
                parseAvatarRecord("thisisatest", {
                    genesisId: "0x0",
                    thor: {} as any,
                }),
            ).resolves.toBeNull()
        })
        describe("erc1155", () => {
            it("should return the value", async () => {
                ;(getCollectibleMetadataOptions as jest.Mock).mockImplementation((...args: any[]) => ({
                    ...jest.requireActual("~Hooks/useCollectibleMetadata").getCollectibleMetadataOptions(...args),
                    queryFn: () => Promise.resolve({ image: "https://image_uri_test.org" }),
                }))
                await expect(() =>
                    parseAvatarRecord("eip155:1/erc1155:0x0/123", {
                        genesisId: "0x0",
                        thor: thorMocker({ erc1155Uri: ["https://vechain1.org"] }),
                    }),
                ).resolves.toBe("https://image_uri_test.org")
            })
            it("should return null if the metadata is either not there or has no image", async () => {
                ;(getCollectibleMetadataOptions as jest.Mock)
                    .mockImplementationOnce((...args: any[]) => ({
                        ...jest.requireActual("~Hooks/useCollectibleMetadata").getCollectibleMetadataOptions(...args),
                        queryFn: () => Promise.resolve(null),
                    }))
                    .mockImplementationOnce((...args: any[]) => ({
                        ...jest.requireActual("~Hooks/useCollectibleMetadata").getCollectibleMetadataOptions(...args),
                        queryFn: () => Promise.resolve({ name: "TEST" }),
                    }))
                await expect(() =>
                    parseAvatarRecord("eip155:1/erc1155:0x0/123", {
                        genesisId: "0x0",
                        thor: thorMocker({ erc1155Uri: ["https://vechain2.org"] }),
                    }),
                ).resolves.toBeNull()
                await expect(() =>
                    parseAvatarRecord("eip155:1/erc1155:0x0/123", {
                        genesisId: "0x0",
                        thor: thorMocker({ erc1155Uri: ["https://vechain3.org"] }),
                    }),
                ).resolves.toBeNull()
            })
            it("should replace the id", async () => {
                ;(getCollectibleMetadataOptions as jest.Mock).mockImplementation((...args: any[]) => ({
                    ...jest.requireActual("~Hooks/useCollectibleMetadata").getCollectibleMetadataOptions(...args),
                    queryFn: () => Promise.resolve({ image: "https://image_uri_test.org" }),
                }))
                await expect(() =>
                    parseAvatarRecord("eip155:1/erc1155:0x0/123", {
                        genesisId: "0x0",
                        thor: thorMocker({ erc1155Uri: ["https://vechain.org/{id}"] }),
                    }),
                ).resolves.toBe("https://image_uri_test.org")
                expect(getCollectibleMetadataOptions).toHaveBeenCalledWith(
                    "https://vechain.org/000000000000000000000000000000000000000000000000000000000000007b",
                )
            })
        })
        describe("erc721", () => {
            it("should return the value", async () => {
                ;(getCollectibleMetadataOptions as jest.Mock).mockImplementation((...args: any[]) => ({
                    ...jest.requireActual("~Hooks/useCollectibleMetadata").getCollectibleMetadataOptions(...args),
                    queryFn: () => Promise.resolve({ image: "https://image_uri_test.org" }),
                }))
                ;(getCachedTokenURI as jest.Mock).mockResolvedValue("https://vechain4.org")
                await expect(() =>
                    parseAvatarRecord("eip155:1/erc721:0x0/123", {
                        genesisId: "0x0",
                        thor: {} as any,
                    }),
                ).resolves.toBe("https://image_uri_test.org")
            })
            it("should return null if the metadata is either not there or has no image", async () => {
                ;(getCollectibleMetadataOptions as jest.Mock)
                    .mockImplementationOnce((...args: any[]) => ({
                        ...jest.requireActual("~Hooks/useCollectibleMetadata").getCollectibleMetadataOptions(...args),
                        queryFn: () => Promise.resolve(null),
                    }))
                    .mockImplementationOnce((...args: any[]) => ({
                        ...jest.requireActual("~Hooks/useCollectibleMetadata").getCollectibleMetadataOptions(...args),
                        queryFn: () => Promise.resolve({ name: "TEST" }),
                    }))
                ;(getCachedTokenURI as jest.Mock)
                    .mockResolvedValueOnce("https://vechain5.org")
                    .mockResolvedValueOnce("https://vechain6.org")

                await expect(() =>
                    parseAvatarRecord("eip155:1/erc721:0x0/123", {
                        genesisId: "0x0",
                        thor: {} as any,
                    }),
                ).resolves.toBeNull()
                await expect(() =>
                    parseAvatarRecord("eip155:1/erc721:0x0/123", {
                        genesisId: "0x0",
                        thor: {} as any,
                    }),
                ).resolves.toBeNull()
            })
        })
        it("should return null if it throws", async () => {
            ;(getCollectibleMetadataOptions as jest.Mock).mockImplementation((...args: any[]) => ({
                ...jest.requireActual("~Hooks/useCollectibleMetadata").getCollectibleMetadataOptions(...args),
                queryFn: () => Promise.reject("TEST_ERROR"),
            }))
            ;(getCachedTokenURI as jest.Mock).mockResolvedValue("https://vechain7.org")
            await expect(() =>
                parseAvatarRecord("eip155:1/erc721:0x0/123", {
                    genesisId: "0x0",
                    thor: {} as any,
                }),
            ).resolves.toBeNull()
        })
    })
})
