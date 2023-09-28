import { EventTypeResponse, IncomingTransferResponse } from "~Networking"
import {
    DEVICE_TYPE,
    LocalDevice,
    NFTMediaType,
    NftCollection,
    TransactionOrigin,
} from "~Model"
import {
    filterNFTTransferEvents,
    filterTransferEventsByType,
    findFirstInvolvedAccount,
} from "./TransferEventHelpers"

const BASE_TRANSFER: IncomingTransferResponse = {
    eventType: EventTypeResponse.NFT,
    tokenAddress: "0x12345",
    from: "0x321",
    to: "0x123",
    txId: "0x123",
    value: "0x123655",
    tokenId: 12,
    topics: ["0x12376543"],
    id: "0x123876543567",
    blockId: "0x1235433486755",
    blockNumber: 1213,
    blockTimestamp: 1238123,
}

const NFT_COLLECTION: NftCollection = {
    address: "0x2",
    symbol: "NFT",
    creator: "0x124",
    fromRegistry: false,
    name: "",
    description: "",
    mediaType: NFTMediaType.IMAGE,
    id: "",
    updated: false,
}

const LOCAL_DEVICE: LocalDevice = {
    rootAddress: "0x3467876543",
    type: DEVICE_TYPE.LOCAL_MNEMONIC,
    alias: "alias",
    index: 0,
    position: 0,
    wallet: "wallet",
}

describe("TransferEventHelpers", () => {
    describe("filterNFTTransferEvents", () => {
        it("empty list", () => {
            expect(filterNFTTransferEvents([], [])).toEqual([])
        })

        it("all same type", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x1",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x2",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x3",
                },
            ]
            expect(filterNFTTransferEvents(transfers, [])).toEqual(transfers)
        })

        it("all different type", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.FUNGIBLE_TOKEN,
                    tokenAddress: "0x1",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.SEMI_FUNGIBLE_TOKEN,
                    tokenAddress: "0x2",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.VET,
                    tokenAddress: "0x3",
                },
            ]
            expect(filterNFTTransferEvents(transfers, [])).toEqual([])
        })

        it("mixed type", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x1",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.SEMI_FUNGIBLE_TOKEN,
                    tokenAddress: "0x2",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.VET,
                    tokenAddress: "0x3",
                },
            ]
            expect(filterNFTTransferEvents(transfers, [])).toEqual([
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x1",
                },
            ])
        })

        it("blacklisted collection", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x1",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x2",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x3",
                },
            ]
            expect(
                filterNFTTransferEvents(transfers, [NFT_COLLECTION]),
            ).toEqual([
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x1",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x3",
                },
            ])
        })
    })

    describe("filterTransferEventsByType", () => {
        it("empty list", () => {
            expect(
                filterTransferEventsByType([], EventTypeResponse.NFT),
            ).toEqual([])
        })

        it("all same type", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x1",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x2",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x3",
                },
            ]
            expect(
                filterTransferEventsByType(transfers, EventTypeResponse.NFT),
            ).toEqual(transfers)
        })

        it("all different type", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.FUNGIBLE_TOKEN,
                    tokenAddress: "0x1",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.SEMI_FUNGIBLE_TOKEN,
                    tokenAddress: "0x2",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.VET,
                    tokenAddress: "0x3",
                },
            ]
            expect(
                filterTransferEventsByType(transfers, EventTypeResponse.NFT),
            ).toEqual([])
        })

        it("mixed type", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x1",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.SEMI_FUNGIBLE_TOKEN,
                    tokenAddress: "0x2",
                },
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.VET,
                    tokenAddress: "0x3",
                },
            ]
            expect(
                filterTransferEventsByType(transfers, EventTypeResponse.NFT),
            ).toEqual([
                {
                    ...BASE_TRANSFER,
                    eventType: EventTypeResponse.NFT,
                    tokenAddress: "0x1",
                },
            ])
        })
    })

    describe("findFirstInvolvedAccount", () => {
        it("empty list", () => {
            expect(findFirstInvolvedAccount([], BASE_TRANSFER)).toEqual(
                undefined,
            )
        })

        it("no account", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    to: "0x321434",
                    from: "0x123",
                },
            ]
            expect(
                findFirstInvolvedAccount(
                    [
                        {
                            address: "0x321",
                            alias: "alias",
                            device: LOCAL_DEVICE,
                            rootAddress: "0x3467876543",
                            index: 0,
                            visible: true,
                        },
                    ],
                    transfers[0],
                ),
            ).toEqual(undefined)
        })

        it("account is the origin", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    to: "0x321",
                    from: "0x123",
                },
            ]
            const account = {
                address: "0x123",
                alias: "alias",
                device: LOCAL_DEVICE,
                rootAddress: "0x3467876543",
                index: 0,
                visible: true,
            }
            expect(findFirstInvolvedAccount([account], transfers[0])).toEqual({
                account,
                origin: TransactionOrigin.FROM,
            })
        })

        it("account is the recipient", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    to: "0x123",
                    from: "0x321",
                },
            ]
            const account = {
                address: "0x123",
                alias: "alias",
                device: LOCAL_DEVICE,
                rootAddress: "0x3467876543",
                index: 0,
                visible: true,
            }
            expect(findFirstInvolvedAccount([account], transfers[0])).toEqual({
                account,
                origin: TransactionOrigin.TO,
            })
        })

        it("account is both origin and recipient", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    to: "0x123",
                    from: "0x123",
                },
            ]
            const account = {
                address: "0x123",
                alias: "alias",
                device: LOCAL_DEVICE,
                rootAddress: "0x3467876543",
                index: 0,
                visible: true,
            }
            expect(findFirstInvolvedAccount([account], transfers[0])).toEqual({
                account,
                origin: TransactionOrigin.TO,
            })
        })

        it("have two accounts one is the origin and the other is the sender", () => {
            const transfers: IncomingTransferResponse[] = [
                {
                    ...BASE_TRANSFER,
                    to: "0x123",
                    from: "0x321",
                },
            ]
            const toAccount = {
                address: "0x123",
                alias: "alias",
                device: LOCAL_DEVICE,
                rootAddress: "0x3467876543",
                index: 0,
                visible: true,
            }
            const fromAccount = {
                address: "0x321",
                alias: "alias",
                device: LOCAL_DEVICE,
                rootAddress: "0x3467876543",
                index: 0,
                visible: true,
            }
            expect(
                findFirstInvolvedAccount(
                    [toAccount, fromAccount],
                    transfers[0],
                ),
            ).toEqual({
                account: toAccount,
                origin: TransactionOrigin.TO,
            })
        })
    })
})
