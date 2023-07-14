import {
    ActivityStatus,
    ActivityType,
    ClauseType,
    ClauseWithMetadata,
    DappTxActivity,
    SwapEvent,
    Token,
    TransactionOutcomes,
} from "~Model"
import TransactionUtils from "."
import * as logger from "~Utils/Logger/Logger"
import { decodeTransferEvent, toDelegation } from "./TransactionUtils"
import { Transaction } from "thor-devkit"
import { VET, genesises } from "~Constants"

const YEET_TOKEN: Token = {
    name: "Yeet Coin",
    symbol: "YEET",
    address: "0xae4c53b120cba91a44832f875107cbc8fbee185c",
    desc: "Alpaca memes",
    icon: "2e434b45fdbf3ea1d2676d3270ad8877221aefd1.png",
    custom: true,
}

const SHA_TOKEN: Token = {
    name: "Safe Haven",
    symbol: "SHA",
    address: "0x5db3c8a942333f6468176a870db36eef120a34dc",
    desc: "Asset Management & Inheritance Solutions",
    icon: "735a5e4a70116463649aa9c508b5d18361f10ab7.png",
    custom: true,
}

const BASE_SAMPLE_ACTIVITY = {
    //Send
    from: "0x",
    to: ["0x"],
    id: "0x6a05ecf6a1305ec61fb8ea65bf077589998149fa10d44c80464df6d93cffaf01",
    blockNumber: 123456,
    isTransaction: true,
    genesisId: genesises.main.id,
    timestamp: 1382337919000,
    gasUsed: 21000,
    gasPayer: "0x",
    delegated: true,
    status: ActivityStatus.SUCCESS,
}

const swapTxOutcomes: TransactionOutcomes = [
    {
        data: "0x095ea7b30000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb0000000000000000000000000000000000000000000001b34d96867d86f63ced",
        to: "0x0000000000000000000000000000456e65726779",
        value: "0x",
        type: ClauseType.DEPLOY_CONTRACT,
    },
    {
        data: "0xe0ce249c00000000000000000000000000000000000000000000001bf8f0421d659000000000000000000000000000000000000000000000000001b34d96867d86f63ced00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000000000000635a94ab0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000170f4ba8e7acf6510f55db26047c83d13498af8a000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
        to: "0x3CA506F873e5819388aa3CE0b1c4FC77b6db0048",
        value: "0x",
        type: ClauseType.SWAP_TOKENS_FOR_VET,
        path: [
            "0x170f4ba8e7acf6510f55db26047c83d13498af8a",
            "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
        ],
    },
    {
        data: "0x9b60cc9700000000000000000000000000000000000000000000000000000000773751940000000000000000000000004167d527340afa546bb88d5d83afb6272e48b40e00000000000000000000000000000000000000000000000000000000000003c2",
        to: "0x0000000000000000000000000000456e65726779",
        value: "0x",
        type: ClauseType.CONTRACT_CALL,
    },
]

const txEventsIncludingSwap: Connex.VM.Event[] = [
    {
        address: "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
        topics: [
            "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c",
            "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
        ],
        data: "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
    },
    {
        address: "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
        topics: [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
            "0x00000000000000000000000025491130a43d43ab0951d66cdf7ddac7b1db681b",
        ],
        data: "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
    },
    {
        address: "0x4e17357053da4b473e2daa2c65c2c949545724b8",
        topics: [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x00000000000000000000000025491130a43d43ab0951d66cdf7ddac7b1db681b",
            "0x0000000000000000000000004f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1",
        ],
        data: "0x000000000000000000000000000000000000000000000000000000000000513e",
    },
    {
        address: "0x25491130a43d43ab0951d66cdf7ddac7b1db681b",
        topics: [
            "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
        ],
        data: "0x0000000000000000000000000000000000000000000000000000001b9044f3c700000000000000000000000000000000000000000004b41c0178a834ac695906",
    },
    {
        address: "0x25491130a43d43ab0951d66cdf7ddac7b1db681b",
        topics: [
            "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
            "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
            "0x0000000000000000000000004f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1",
        ],
        data: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000513e0000000000000000000000000000000000000000000000000000000000000000",
    },
]

describe("TransactionUtils", () => {
    describe("isVETtransferClause", () => {
        it("should return true for a VET transfer clause", () => {
            expect(
                TransactionUtils.isVETtransferClause({
                    data: "0x",
                    value: "1000",
                    to: "0x",
                }),
            ).toBe(true)
        })
        it("should return false for a non-VET transfer clause", () => {
            expect(
                TransactionUtils.isVETtransferClause({
                    data: "0x123",
                    value: "0",
                    to: "0x",
                }),
            ).toBe(false)
        })
    })

    describe("isTokenTransferClause", () => {
        it("should return true for a token transfer clause", () => {
            expect(
                TransactionUtils.isTokenTransferClause({
                    data: TransactionUtils.TRANSFER_SIG,
                    value: "1000",
                    to: "0x",
                }),
            ).toBe(true)
        })
        it("should return false for a non-token transfer clause", () => {
            expect(
                TransactionUtils.isTokenTransferClause({
                    data: "0x123",
                    value: "0",
                    to: "0x",
                }),
            ).toBe(false)
        })
        it("should return false for a clause without data", () => {
            expect(
                TransactionUtils.isTokenTransferClause({
                    data: "",
                    value: "0",
                    to: "0x",
                }),
            ).toBe(false)
        })
    })

    describe("decodeTokenTransferClause", () => {
        it("should return decoded token transfer data if data starts with TRANSFER_SIG", () => {
            const data =
                "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000"
            expect(
                TransactionUtils.decodeTokenTransferClause({
                    data,
                    to: "0x",
                    value: "0x",
                }),
            ).toEqual({
                to: "0x3ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                amount: "60000000000000000000",
            })
        })
        it("should return null if data does not start with TRANSFER_SIG", () => {
            const data = "0x123"
            expect(
                TransactionUtils.decodeTokenTransferClause({
                    data,
                    to: "0x",
                    value: "0x",
                }),
            ).toBe(null)
        })
        it("should return null if data is empty", () => {
            const data = ""
            expect(
                TransactionUtils.decodeTokenTransferClause({
                    data,
                    to: "0x",
                    value: "0x",
                }),
            ).toBe(null)
        })
    })

    describe("decodeAsTokenTransferClause", () => {
        it("should return decoded token transfer data if to address equals token address", () => {
            const clause = {
                to: YEET_TOKEN.address,
                data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeAsTokenTransferClause(
                    clause,
                    YEET_TOKEN,
                ),
            ).toEqual({
                to: "0x3ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                amount: "60000000000000000000",
            })
        })
        it("should return null if to address does not equal token address", () => {
            const clause = {
                to: "0x",
                data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeAsTokenTransferClause(
                    clause,
                    YEET_TOKEN,
                ),
            ).toBe(null)
        })

        it("should log error when fails to decode token transfer clause", () => {
            const debugSpy = jest.spyOn(logger, "debug")

            const clause = {
                data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000",
                to: "0x",
                value: "0x",
            }

            expect(TransactionUtils.decodeTokenTransferClause(clause)).toBe(
                null,
            )

            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })
    })

    describe("decodeSwapExactVETForTokensClause & decodeSwapExactETHForTokensClause", () => {
        it("should return decoded SWAP EXACT VET FOR TOKENS clause if data starts with SWAP_EXACT_VET_FOR_TOKENS_SIG", () => {
            const clauseData =
                "0x1239cc95000000000000000000000000000000000000000000000073734ece2980a4cae600000000000000000000000000000000000000000000000000000000000000800000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db0048000000000000000000000000000000000000000000000000000000006465ad470000000000000000000000000000000000000000000000000000000000000002000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a9997000000000000000000000000170f4ba8e7acf6510f55db26047c83d13498af8a"
            const clause = {
                data: clauseData,
                to: "0x6c0A6e1d922E0e63901301573370b932AE20DAdB",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactVETForTokensClause(clause),
            ).toEqual({
                ...clause,
                to: "0x3ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                type: ClauseType.SWAP_VET_FOR_TOKENS,
                data: clauseData,
                path: [
                    "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                    "0x170f4ba8e7acf6510f55db26047c83d13498af8a",
                ],
            })
        })

        it("should return null if data does not start with SWAP_EXACT_VET_FOR_TOKENS_SIG", () => {
            const clauseData = "0x123"
            const clause = {
                data: clauseData,
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactVETForTokensClause(clause),
            ).toBe(null)
        })

        it("should return null if data is empty", () => {
            const clause = {
                data: "",
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactVETForTokensClause(clause),
            ).toBe(null)
        })

        it("should log error when fails to decode SWAP EXACT VET FOR TOKENS clause", () => {
            const debugSpy = jest.spyOn(logger, "debug")
            const clause = {
                data: "0x1239cc95000000000000000000000000000000000000000000000073734ece2980a4cae600000000000000000000000000000000000000000000000000000000000000800000000000000000000000003ca506f",
                to: "0x",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactVETForTokensClause(clause),
            ).toBe(null)
            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })

        it("should return decoded SWAP EXACT VET FOR TOKENS clause if data starts with SWAP_EXACT_ETH_FOR_TOKENS_SIG", () => {
            const clauseData =
                "0x7ff36ab50000000000000000000000000000000000000000000000528554d30c8540600000000000000000000000000000000000000000000000000000000000000000800000000000000000000000004f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1000000000000000000000000000000000000000000000000000000006465f99a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000045429a2255e7248e57fce99e7239aed3f84b7a5300000000000000000000000089827f7bb951fd8a56f8ef13c5bfee38522f2e1f"
            const clause = {
                data: clauseData,
                to: "0x576da7124C7bB65a692d95848276367e5a844d95",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactETHForTokensClause(clause),
            ).toEqual({
                ...clause,
                to: "0x4f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1",
                type: ClauseType.SWAP_VET_FOR_TOKENS,
                data: clauseData,
                path: [
                    "0x45429a2255e7248e57fce99e7239aed3f84b7a53",
                    "0x89827f7bb951fd8a56f8ef13c5bfee38522f2e1f",
                ],
            })
        })

        it("should return null if data does not start with SWAP_EXACT_ETH_FOR_TOKENS_SIG", () => {
            const clauseData = "0x123"
            const clause = {
                data: clauseData,
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactETHForTokensClause(clause),
            ).toBe(null)
        })

        it("should return null if data is empty for decodeSwapExactETHForTokensClause", () => {
            const clause = {
                data: "",
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactETHForTokensClause(clause),
            ).toBe(null)
        })

        it("should log error when fails to decode SWAP EXACT VET FOR TOKENS clause with SWAP_EXACT_ETH_FOR_TOKENS_SIG", () => {
            const debugSpy = jest.spyOn(logger, "debug")
            const clause = {
                data: "0x7ff36ab50000000000000000000000000000000000000000000000528554d30c8540600000000000000000000000000000000000000000000000000000000000000000800000000000000000000000004f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1000000000000000000000000000000000000000000000000000000006465f99a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000045429a2255e7248e57fce99e7239aed3f84b7a53000000000000000000",
                to: "0x",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactETHForTokensClause(clause),
            ).toBe(null)
            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })
    })

    describe("decodeSwapTokensForExactVETClause & decodeSwapTokensForExactETHClause", () => {
        it("should return decoded SWAP EXACT TOKENS FOR VET clause if data starts with SWAP_TOKENS_FOR_EXACT_VET_SIG", () => {
            const clauseData =
                "0xe0ce249c00000000000000000000000000000000000000000000006c5db2a4d815dc00000000000000000000000000000000000000000000000008c441191c7520987f9f00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000000000000643616940000000000000000000000000000000000000000000000000000000000000002000000000000000000000000170f4ba8e7acf6510f55db26047c83d13498af8a000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a9997"
            const clause = {
                data: clauseData,
                to: "0x6c0A6e1d922E0e63901301573370b932AE20DAdB",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapTokensForExactVETClause(clause),
            ).toEqual({
                ...clause,
                to: "0x3ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                type: ClauseType.SWAP_TOKENS_FOR_VET,
                data: clauseData,
                path: [
                    "0x170f4ba8e7acf6510f55db26047c83d13498af8a",
                    "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                ],
            })
        })

        it("should return null if data does not start with SWAP_TOKENS_FOR_EXACT_VET_SIG", () => {
            const clauseData = "0x123"
            const clause = {
                data: clauseData,
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapTokensForExactVETClause(clause),
            ).toBe(null)
        })

        it("should return null if data is empty", () => {
            const clause = {
                data: "",
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapTokensForExactVETClause(clause),
            ).toBe(null)
        })

        it("should log error when fails to decode SWAP EXACT TOKENS FOR VET clause", () => {
            const debugSpy = jest.spyOn(logger, "debug")
            const clause = {
                data: "0xe0ce249c00000000000000000000000000000000000000000000006c5db2a4d815dc00000000000000000000000000000000000000000000000008c441191c7520987f9f000000",
                to: "0x",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapTokensForExactVETClause(clause),
            ).toBe(null)
            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })

        it("should return decoded SWAP EXACT TOKENS FOR VET clause if data starts with SWAP_EXACT_TOKENS_FOR_ETH_SIG", () => {
            const clauseData =
                "0x18cbafe500000000000000000000000000000000000000000000000149601b407b1f0000000000000000000000000000000000000000000000000000142906f40935c00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000b42cd3d05ab10be78ef9165661ff11cd6f29b31300000000000000000000000000000000000000000000000000000000646f268900000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000456e6572677900000000000000000000000045429a2255e7248e57fce99e7239aed3f84b7a53"
            const clause = {
                data: clauseData,
                to: "0x576da7124C7bB65a692d95848276367e5a844d95",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactTokensForETHClause(clause),
            ).toEqual({
                ...clause,
                to: "0xb42cd3d05ab10be78ef9165661ff11cd6f29b313",
                type: ClauseType.SWAP_TOKENS_FOR_VET,
                data: clauseData,
                path: [
                    "0x0000000000000000000000000000456e65726779",
                    "0x45429a2255e7248e57fce99e7239aed3f84b7a53",
                ],
            })
        })

        it("should return null if data does not start with SWAP_EXACT_TOKENS_FOR_ETH_SIG", () => {
            const clauseData = "0x123"
            const clause = {
                data: clauseData,
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactTokensForETHClause(clause),
            ).toBe(null)
        })

        it("should return null if data is empty for decodeSwapExactTokensForETHClause", () => {
            const clause = {
                data: "",
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactTokensForETHClause(clause),
            ).toBe(null)
        })

        it("should log error when fails to decode SWAP EXACT TOKENS FOR VET clause for decodeSwapExactTokensForETHClause", () => {
            const debugSpy = jest.spyOn(logger, "debug")
            const clause = {
                data: "0x18cbafe500000000000000000000000000000000000000000000000149601b407b1f0000000000000000000000000000000000000000000000000000142906f40935c00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000b42cd3d05ab10be78ef9165661ff11cd6f29b31300000000000000000000000000000000000000000000000000000000646f268900000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000456e6572677900000000000000000000000045429a2255e7248e57fce9",
                to: "0x",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactTokensForETHClause(clause),
            ).toBe(null)
            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })
    })

    describe("decodeSwapExactTokensForTokensClause", () => {
        it("should return decoded SWAP EXACT TOKENS FOR TOKENS clause if data starts with SWAP_EXACT_TOKENS_FOR_TOKENS_SIG", () => {
            const clauseData =
                "0x38ed173900000000000000000000000000000000000000000000000163b8eef1753340000000000000000000000000000000000000000000000001d78fe6190365394bab00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db00480000000000000000000000000000000000000000000000000000000063efbbc8000000000000000000000000000000000000000000000000000000000000000300000000000000000000000023368c20c16f64ecbb30164a08666867be22f216000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a99970000000000000000000000005db3c8a942333f6468176a870db36eef120a34dc"
            const clause = {
                data: clauseData,
                to: "0x6c0A6e1d922E0e63901301573370b932AE20DAdB",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactTokensForTokensClause(clause),
            ).toEqual({
                ...clause,
                to: "0x3ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                type: ClauseType.SWAP_TOKENS_FOR_TOKENS,
                data: clauseData,
                path: [
                    "0x23368c20c16f64ecbb30164a08666867be22f216",
                    "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                    "0x5db3c8a942333f6468176a870db36eef120a34dc",
                ],
            })
        })

        it("should return null if data does not start with SWAP_EXACT_TOKENS_FOR_TOKENS_SIG", () => {
            const clauseData = "0x123"
            const clause = {
                data: clauseData,
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactTokensForTokensClause(clause),
            ).toBe(null)
        })

        it("should return null if data is empty", () => {
            const clause = {
                data: "",
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactTokensForTokensClause(clause),
            ).toBe(null)
        })

        it("should log error when fails to decode SWAP EXACT TOKENS FOR TOKENS clause", () => {
            const debugSpy = jest.spyOn(logger, "debug")
            const clause = {
                data: "0x38ed173900000000000000000000000000000000000000000000000163b8eef1753340000000000000000000000000000000000000000000000001d78fe6190365394bab00000000000000000000000000000",
                to: "0x",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactTokensForTokensClause(clause),
            ).toBe(null)
            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })
    })

    describe("decodeSwapVETForExactTokensClause", () => {
        it("should return decoded SWAP VET FOR EXACT TOKENS clause if data starts with SWAP_VET_FOR_EXACT_TOKENS_SIG", () => {
            const clauseData =
                "0x5ffd5ee60000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000004f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1000000000000000000000000000000000000000000000000000000006465f74e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a9997000000000000000000000000170f4ba8e7acf6510f55db26047c83d13498af8a"
            const clause = {
                data: clauseData,
                to: "0x6c0A6e1d922E0e63901301573370b932AE20DAdB",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapVETForExactTokensClause(clause),
            ).toEqual({
                ...clause,
                to: "0x4f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1",
                type: ClauseType.SWAP_VET_FOR_TOKENS,
                data: clauseData,
                path: [
                    "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                    "0x170f4ba8e7acf6510f55db26047c83d13498af8a",
                ],
            })
        })

        it("should return null if data does not start with SWAP_VET_FOR_EXACT_TOKENS_SIG", () => {
            const clauseData = "0x123"
            const clause = {
                data: clauseData,
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapVETForExactTokensClause(clause),
            ).toBe(null)
        })

        it("should return null if data is empty", () => {
            const clause = {
                data: "",
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapVETForExactTokensClause(clause),
            ).toBe(null)
        })

        it("should log error when fails to decode SWAP EXACT TOKENS FOR TOKENS clause", () => {
            const debugSpy = jest.spyOn(logger, "debug")
            const clause = {
                data: "0x5ffd5ee60000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000004f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1000000000000000000000000000000000000000000000000000000006465f74e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a9997000000000000000000000000170f4ba8e7acf6510f55db260",
                to: "0x",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapVETForExactTokensClause(clause),
            ).toBe(null)
            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })
    })

    describe("decodeSwapExactTokensForVETClause", () => {
        it("should return decoded SWAP EXACT TOKENS FOR VET clause if data starts with SWAP_EXACT_TOKENS_FOR_VET", () => {
            const clauseData =
                "0xfa64746f00000000000000000000000000000000000000000000008ac9fbee840f4d595800000000000000000000000000000000000000000000000886f3473e40f16fd100000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000c8be491cf06b53fd5e401d2d57cb58b84b47883600000000000000000000000000000000000000000000000000000000646f19bf00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000456e65726779000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a9997"
            const clause = {
                data: clauseData,
                to: "0x6c0A6e1d922E0e63901301573370b932AE20DAdB",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactTokensForVETClause(clause),
            ).toEqual({
                ...clause,
                to: "0xc8be491cf06b53fd5e401d2d57cb58b84b478836",
                type: ClauseType.SWAP_TOKENS_FOR_VET,
                data: clauseData,
                path: [
                    "0x0000000000000000000000000000456e65726779",
                    "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                ],
            })
        })

        it("should return null if data does not start with SWAP_EXACT_TOKENS_FOR_VET", () => {
            const clauseData = "0x123"
            const clause = {
                data: clauseData,
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactTokensForVETClause(clause),
            ).toBe(null)
        })

        it("should return null if data is empty", () => {
            const clause = {
                data: "",
                to: "0x",
                value: "0x",
            }
            expect(
                TransactionUtils.decodeSwapExactTokensForVETClause(clause),
            ).toBe(null)
        })

        it("should log error when fails to decode SWAP EXACT TOKENS FOR TOKENS clause", () => {
            const debugSpy = jest.spyOn(logger, "debug")
            const clause = {
                data: "0xfa64746f00000000000000000000000000000000000000000000008ac9fbee840f4d595800000000000000000000000000000000000000000000000886f3473e40f16fd100000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000c8be491cf06b53fd5e401d2d57cb58b84b47883600000000000000000000000000000000000000000000000000000000646f19bf00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000456e65726779000000000000000000000000d8ccdd85abdbf68dfec",
                to: "0x",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeSwapExactTokensForVETClause(clause),
            ).toBe(null)
            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })
    })

    describe("interpretClauses", () => {
        it("should interpret clauses correctly", () => {
            const swapTokensForTokensClauseData =
                "0x38ed173900000000000000000000000000000000000000000000000163b8eef1753340000000000000000000000000000000000000000000000001d78fe6190365394bab00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db00480000000000000000000000000000000000000000000000000000000063efbbc8000000000000000000000000000000000000000000000000000000000000000300000000000000000000000023368c20c16f64ecbb30164a08666867be22f216000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a99970000000000000000000000005db3c8a942333f6468176a870db36eef120a34dc"

            const clause = [
                {
                    to: SHA_TOKEN.address,
                    value: "0x",
                    data: "0xa9059cbb00000000000000000000000063792f9baef181e44fc5f81918809fb98e4f71c50000000000000000000000000000000000000000000215a1794693c777000000",
                },
                {
                    data: swapTokensForTokensClauseData,
                    to: "0x6c0A6e1d922E0e63901301573370b932AE20DAdB",
                    value: "0x",
                },
            ]
            const tokens = [SHA_TOKEN]
            const expected = [
                {
                    to: "0x63792f9baef181e44fc5f81918809fb98e4f71c5",
                    value: "0x",
                    data: "0x",
                    type: ClauseType.TRANSFER,
                    tokenSymbol: "SHA",
                    amount: 2520000000000000000000000,
                },
                {
                    value: "0x",
                    to: "0x3ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                    type: ClauseType.SWAP_TOKENS_FOR_TOKENS,
                    data: swapTokensForTokensClauseData,
                    path: [
                        "0x23368c20c16f64ecbb30164a08666867be22f216",
                        "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                        "0x5db3c8a942333f6468176a870db36eef120a34dc",
                    ],
                },
            ]
            expect(TransactionUtils.interpretClauses(clause, tokens)).toEqual(
                expected,
            )
        })
        it("should interpret clauses correctly with VET transfer", () => {
            const swapTokensForTokensClauseData =
                "0x38ed173900000000000000000000000000000000000000000000000163b8eef1753340000000000000000000000000000000000000000000000001d78fe6190365394bab00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db00480000000000000000000000000000000000000000000000000000000063efbbc8000000000000000000000000000000000000000000000000000000000000000300000000000000000000000023368c20c16f64ecbb30164a08666867be22f216000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a99970000000000000000000000005db3c8a942333f6468176a870db36eef120a34dc"

            const clause = [
                {
                    to: "0x63792f9baef181e44fc5f81918809fb98e4f71c5",
                    value: "0x124567",
                    data: "0xa9059cbb00000000000000000000000063792f9baef181e44fc5f81918809fb98e4f71c50000000000000000000000000000000000000000000215a1794693c777000000",
                },
                {
                    data: swapTokensForTokensClauseData,
                    to: "0x6c0A6e1d922E0e63901301573370b932AE20DAdB",
                    value: "0x",
                },
            ]
            const expected = [
                {
                    amount: 1197415,
                    data: "0x",
                    to: "0x63792f9baef181e44fc5f81918809fb98e4f71c5",
                    tokenSymbol: "VET",
                    type: ClauseType.TRANSFER,
                    value: "0x124567",
                },
                {
                    data: "0xa9059cbb00000000000000000000000063792f9baef181e44fc5f81918809fb98e4f71c50000000000000000000000000000000000000000000215a1794693c777000000",
                    to: "0x63792f9baef181e44fc5f81918809fb98e4f71c5",
                    type: ClauseType.CONTRACT_CALL,
                    value: "0x124567",
                },
                {
                    data: swapTokensForTokensClauseData,
                    to: "0x3ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                    value: "0x",
                    type: ClauseType.SWAP_TOKENS_FOR_TOKENS,
                    path: [
                        "0x23368c20c16f64ecbb30164a08666867be22f216",
                        "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                        "0x5db3c8a942333f6468176a870db36eef120a34dc",
                    ],
                },
            ]

            expect(TransactionUtils.interpretClauses(clause, [])).toEqual(
                expected,
            )
        })
    })

    describe("interpretContractCall", () => {
        it("should interpret contract calls correctly", () => {
            const clause = {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x23421234525252525235454354324324235",
            }
            const expected = [
                {
                    to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                    value: "0x0",
                    data: "0x23421234525252525235454354324324235",
                    type: ClauseType.CONTRACT_CALL,
                },
            ]
            expect(TransactionUtils.interpretContractCall(clause, [])).toEqual(
                expected,
            )
        })
    })

    describe("interpretContractClause", () => {
        it("should interpret contract creation clause correctly", () => {
            const clause = {
                to: null,
                value: "0x0",
                data: "0x345abc",
            }

            const expected = [
                {
                    ...clause,
                    type: ClauseType.DEPLOY_CONTRACT,
                    data: clause.data || "0x",
                },
            ]

            expect(
                TransactionUtils.interpretContractClause(clause, []),
            ).toEqual(expected)
        })

        it("should interpret contract calls clause correctly", () => {
            const clause = {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x0",
                data: "0x23421234525252525235454354324324235",
            }

            const tokens = [SHA_TOKEN]

            const expected = [
                {
                    ...clause,
                    type: ClauseType.CONTRACT_CALL,
                    to: clause.to,
                    data: clause.data || "0x",
                },
            ]

            expect(
                TransactionUtils.interpretContractClause(clause, tokens),
            ).toEqual(expected)
        })
        it("should use default data if data is not provided", () => {
            const clause = {
                to: null,
                value: "0x0",
                data: "",
            }

            const expected = [
                {
                    ...clause,
                    type: ClauseType.DEPLOY_CONTRACT,
                    data: "0x",
                },
            ]

            expect(
                TransactionUtils.interpretContractClause(clause, []),
            ).toEqual(expected)
        })
    })

    describe("getContractAddressFromClause", () => {
        it("should return token address from VET transfer clause", () => {
            const clause = {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x123456",
                data: "0x",
            }

            const expected = "VET"

            expect(
                TransactionUtils.getContractAddressFromClause(clause),
            ).toEqual(expected)
        })
        it("should return token address from fungible token transfer clause", () => {
            const clause = {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x",
                data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000",
            }

            const expected = "0x576da7124c7bb65a692d95848276367e5a844d95"

            expect(
                TransactionUtils.getContractAddressFromClause(clause),
            ).toEqual(expected)
        })
        it("should return undefined if clause is not a token transfer", () => {
            const clause = {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x",
                data: "0x",
            }

            const expected = undefined

            expect(
                TransactionUtils.getContractAddressFromClause(clause),
            ).toEqual(expected)
        })
    })

    describe("getAmountFromClause", () => {
        it("should return amount from VET transfer clause", () => {
            const clause = {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x123456",
                data: "0x",
            }

            const expected = "1193046"

            expect(TransactionUtils.getAmountFromClause(clause)).toEqual(
                expected,
            )
        })
        it("should return amount from fungible token transfer clause", () => {
            const clause = {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x",
                data: "0xa9059cbb0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000340aad21b3b700000",
            }

            const expected = "60000000000000000000"

            expect(TransactionUtils.getAmountFromClause(clause)).toEqual(
                expected,
            )
        })
        it("should return undefined if clause is not a token transfer", () => {
            const clause = {
                to: "0x576da7124c7bb65a692d95848276367e5a844d95",
                value: "0x",
                data: "0x",
            }

            const expected = undefined

            expect(TransactionUtils.getAmountFromClause(clause)).toEqual(
                expected,
            )
        })
    })

    describe("isSwapClause", () => {
        it("should return true if clause is a swap tokens for tokens clause", () => {
            const clauseWithMetadata: ClauseWithMetadata = {
                to: "0x0000000000000000000000000000456e65726779",
                value: "0x1234",
                data: "0x1352",
                type: ClauseType.SWAP_TOKENS_FOR_TOKENS,
            }

            expect(TransactionUtils.isSwapClause(clauseWithMetadata)).toEqual(
                true,
            )
        })
        it("should return true if clause is a swap tokens for vet clause", () => {
            const clauseWithMetadata: ClauseWithMetadata = {
                to: "0x0000000000000000000000000000456e65726779",
                value: "0x1234",
                data: "0x1352",
                type: ClauseType.SWAP_TOKENS_FOR_VET,
            }

            expect(TransactionUtils.isSwapClause(clauseWithMetadata)).toEqual(
                true,
            )
        })
        it("should return true if clause is a swap vet for tokens clause", () => {
            const clauseWithMetadata: ClauseWithMetadata = {
                to: "0x0000000000000000000000000000456e65726779",
                value: "0x1234",
                data: "0x1352",
                type: ClauseType.SWAP_VET_FOR_TOKENS,
            }

            expect(TransactionUtils.isSwapClause(clauseWithMetadata)).toEqual(
                true,
            )
        })
        it("should return false if clause is not a swap clause", () => {
            const clauseWithMetadata: ClauseWithMetadata = {
                to: "0x0000000000000000000000000000456e65726779",
                value: "0x1234",
                data: "0x1352",
                type: ClauseType.NFT_APPROVE,
            }

            expect(TransactionUtils.isSwapClause(clauseWithMetadata)).toEqual(
                false,
            )
        })
    })

    describe("isSwapTransaction", () => {
        it("should return true if transaction is a swap transaction", () => {
            expect(TransactionUtils.isSwapTransaction(swapTxOutcomes)).toEqual(
                true,
            )
        })
        it("should return false if transaction is not a swap transaction", () => {
            const txOutcomes: TransactionOutcomes = [
                {
                    data: "0x095ea7b30000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb0000000000000000000000000000000000000000000001b34d96867d86f63ced",
                    to: "0x0000000000000000000000000000456e65726779",
                    value: "0x",
                    type: ClauseType.DEPLOY_CONTRACT,
                },
                {
                    data: "0x9b60cc9700000000000000000000000000000000000000000000000000000000773751940000000000000000000000004167000000000000000000000000000000000000000000000000003c2",
                    to: "0x0000000000000000000000000000456e65726779",
                    value: "0x",
                    type: ClauseType.CONTRACT_CALL,
                },
                {
                    data: "0x9b60cc9700000000000000000000000000000000000000000000000000000000773751940000000000000000000000004167d527340afa546bb88d5d83afb6272e48b40e00000000000000000000000000000000000000000000000000000000000003c2",
                    to: "0x0000000000000000000000000000456e65726779",
                    value: "0x",
                    type: ClauseType.CONTRACT_CALL,
                },
            ]

            expect(TransactionUtils.isSwapTransaction(txOutcomes)).toEqual(
                false,
            )
        })
    })

    describe("findAndDecodeSwapEvents", () => {
        it("should return decoded swap event if events include swap event", () => {
            const decodedSwapEvent: SwapEvent[] = [
                {
                    sender: "0x6c0a6e1d922e0e63901301573370b932ae20dadb",
                    amount0In: "0",
                    amount1In: "1000000000000000000",
                    amount0Out: "20798",
                    amount1Out: "0",
                    to: "0x4f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1",
                },
            ]

            expect(
                TransactionUtils.findAndDecodeSwapEvents(txEventsIncludingSwap),
            ).toEqual(decodedSwapEvent)
        })

        it("should return decoded swap event for swap tokens for tokens", () => {
            const decodedSwapEvent: SwapEvent[] = [
                {
                    sender: "0x6c0a6e1d922e0e63901301573370b932ae20dadb",
                    amount0In: "7647547119928357448394",
                    amount1In: "0",
                    amount0Out: "0",
                    amount1Out: "516000000000000000000",
                    to: "0x6c0a6e1d922e0e63901301573370b932ae20dadb",
                },
            ]

            const txEventsWithSwapEvent = [
                {
                    address: "0xD86bed355d9d6A4c951e96755Dd0c3cf004d6CD0",
                    topics: [
                        "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
                        "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                        "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                    ],
                    data: "0x00000000000000000000000000000000000000000000019e9309432237646aca0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001bf8f0421d65900000",
                },
            ]

            expect(
                TransactionUtils.findAndDecodeSwapEvents(txEventsWithSwapEvent),
            ).toEqual(decodedSwapEvent)
        })

        it("should throw if decoding swap event fails", () => {
            const debugSpy = jest.spyOn(logger, "debug")

            const txEventsIncludingCorruptedSwapEvent = [
                {
                    address: "0x25491130a43d43ab0951d66cdf7ddac7b1db681b",
                    topics: [
                        "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
                        "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                        "0x0000000000000000000000004f4e906d3de39a7f2952d3d9cf84c0ca4cb476b1",
                    ],
                    data: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de00000000000000000000000000000000",
                },
            ]

            expect(
                TransactionUtils.decodeSwapEvent(
                    txEventsIncludingCorruptedSwapEvent[0],
                ),
            ).toBe(null)

            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })

        it("should return empty array if events do not include swap event", () => {
            const txEventsWithSwapEvent = [
                {
                    address: "0xD86bed355d9d6A4c951e96755Dd0c3cf004d6CD0",
                    topics: [
                        "0x2",
                        "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                        "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                    ],
                    data: "0x00000000000000000000000000000000000000000000019e9",
                },
            ]

            expect(
                TransactionUtils.findAndDecodeSwapEvents(txEventsWithSwapEvent),
            ).toEqual([])
        })
    })

    describe("decodeSwapTransferAmounts", () => {
        const decodedClauses = [
            {
                to: "0x0000000000000000000000000000456e65726779",
                value: "0x1234",
                data: "0x1352",
                type: ClauseType.SWAP_VET_FOR_TOKENS,
                path: [
                    "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                    "0x170f4ba8e7acf6510f55db26047c83d13498af8a",
                ],
            },
        ]

        const activity: DappTxActivity = {
            ...BASE_SAMPLE_ACTIVITY,
            type: ActivityType.DAPP_TRANSACTION,
            clauses: decodedClauses,
            outputs: [
                {
                    contractAddress:
                        "0xD86bed355d9d6A4c951e96755Dd0c3cf004d6CD0",
                    events: [
                        {
                            address:
                                "0xD86bed355d9d6A4c951e96755Dd0c3cf004d6CD0",
                            topics: [
                                "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
                                "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                                "0x0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                            ],
                            data: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014588f0b5ac7de34a600000000000000000000000000000000000000000000017da381afcfc5b1b4160000000000000000000000000000000000000000000000000000000000000000",
                        },
                    ],
                    transfers: [],
                },
            ],
        }

        const activitySwapTokensForTokens: DappTxActivity = {
            ...BASE_SAMPLE_ACTIVITY,
            type: ActivityType.DAPP_TRANSACTION,
            clauses: decodedClauses,
            outputs: [
                {
                    contractAddress:
                        "0x0000000000000000000000000000456e65726779",
                    events: [
                        {
                            address:
                                "0xae4c53b120cba91a44832f875107cbc8fbee185c",
                            topics: [
                                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                "0x0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                                "0x000000000000000000000000516eca119f673f6747c81189bef4f14367c0c2b7",
                            ],
                            data: "0x00000000000000000000000000000000000000000000008cf23f909c0fa00000",
                        },
                        {
                            address:
                                "0x516eCA119f673f6747c81189Bef4F14367c0c2B7",
                            topics: [
                                "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
                                "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                                "0x000000000000000000000000a14a5bdd5ab3d51062c5b243a2e6fb0949fee2f3",
                            ],
                            data: "0x00000000000000000000000000000000000000000000008cf23f909c0fa000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c376359de51004678",
                        },
                        {
                            address:
                                "0xa14A5bDD5AB3D51062c5B243a2e6Fb0949fee2F3",
                            topics: [
                                "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
                                "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                                "0x0000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db0048",
                            ],
                            data: "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c376359de5100467800000000000000000000000000000000000000000000018ee9b2bf88f5dfda830000000000000000000000000000000000000000000000000000000000000000",
                        },
                    ],
                    transfers: [],
                },
            ],
        }

        it("should return decoded swap transfer amounts if transaction is a swap tokens for vet transaction", () => {
            const decodedClausesSwapTokensForVet = [
                {
                    to: "0x3CA506F873e5819388aa3CE0b1c4FC77b6db0048",
                    value: "0x",
                    data: "0xfa64746f00000000000000000000000000000000000000000000006c6b935b8bbd400000000000000000000000000000000000000000000000000009f0ee3e6a913c48e100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db004800000000000000000000000000000000000000000000000000000000633107dc0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000170f4ba8e7acf6510f55db26047c83d13498af8a000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                    type: ClauseType.SWAP_TOKENS_FOR_VET,
                    path: [
                        "0x170f4ba8e7acf6510f55db26047c83d13498af8a",
                        "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                    ],
                },
            ]

            const activitySwapTokensForVet: DappTxActivity = {
                ...BASE_SAMPLE_ACTIVITY,
                type: ActivityType.DAPP_TRANSACTION,
                clauses: decodedClauses,
                outputs: [
                    {
                        contractAddress:
                            "0x0000000000000000000000000000456e65726779",
                        events: [
                            {
                                address:
                                    "0xD86bed355d9d6A4c951e96755Dd0c3cf004d6CD0",
                                topics: [
                                    "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
                                    "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                                    "0x0000000000000000000000006c0a6e1d922e0e63901301573370b932ae20dadb",
                                ],
                                data: "0x00000000000000000000000000000000000000000000006c6b935b8bbd40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009fda7c149d1f62fa5",
                            },
                        ],
                        transfers: [],
                    },
                ],
            }

            const decodedTransferAmounts =
                TransactionUtils.decodeSwapTransferAmounts(
                    decodedClausesSwapTokensForVet,
                    activitySwapTokensForVet,
                )

            expect(decodedTransferAmounts).toEqual({
                paidAmount: "2000000000000000000000",
                paidTokenAddress: "0x170f4ba8e7acf6510f55db26047c83d13498af8a",
                receivedAmount: "184298486798891757477",
                receivedTokenAddress: VET.address,
            })
        })

        it("should return decoded swap transfer amounts if transaction is a swap tokens for tokens transaction", () => {
            const decodedClausesSwapTokensForVet = [
                {
                    to: "0x3CA506F873e5819388aa3CE0b1c4FC77b6db0048",
                    value: "0x",
                    data: "0x38ed173900000000000000000000000000000000000000000000008cf23f909c0fa0000000000000000000000000000000000000000000000000018ceda14d3a966704ba00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000003ca506f873e5819388aa3ce0b1c4fc77b6db0048000000000000000000000000000000000000000000000000000000006371a7c40000000000000000000000000000000000000000000000000000000000000003000000000000000000000000ae4c53b120cba91a44832f875107cbc8fbee185c000000000000000000000000d8ccdd85abdbf68dfec95f06c973e87b1b5a99970000000000000000000000005db3c8a942333f6468176a870db36eef120a34dc",
                    type: ClauseType.SWAP_TOKENS_FOR_TOKENS,
                    path: [
                        "0xae4c53b120cba91a44832f875107cbc8fbee185c",
                        "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
                        "0x5db3c8a942333f6468176a870db36eef120a34dc",
                    ],
                },
            ]

            const decodedTransferAmounts =
                TransactionUtils.decodeSwapTransferAmounts(
                    decodedClausesSwapTokensForVet,
                    activitySwapTokensForTokens,
                )

            expect(decodedTransferAmounts).toEqual({
                paidAmount: "2600000000000000000000",
                paidTokenAddress: "0xae4c53b120cba91a44832f875107cbc8fbee185c",
                receivedAmount: "7358643873888054794883",
                receivedTokenAddress:
                    "0x5db3c8a942333f6468176a870db36eef120a34dc",
            })
        })

        it("should return decoded swap transfer amounts if transaction is a swap transaction", () => {
            const decodedTransferAmounts =
                TransactionUtils.decodeSwapTransferAmounts(
                    decodedClauses,
                    activity,
                )

            expect(decodedTransferAmounts).toEqual({
                paidAmount: "375316213155726505126",
                paidTokenAddress: VET.address,
                receivedAmount: "7039991383490426942486",
                receivedTokenAddress:
                    "0x170f4ba8e7acf6510f55db26047c83d13498af8a",
            })
        })

        it("should throw an error if transaction is not a swap transaction", () => {
            let clausesWithoutSwap = JSON.parse(JSON.stringify(decodedClauses))
            clausesWithoutSwap[0].type = ClauseType.TRANSFER

            expect(() =>
                TransactionUtils.decodeSwapTransferAmounts(
                    clausesWithoutSwap,
                    activity,
                ),
            ).toThrow("Transaction is not a swap transaction")
        })

        it("should throw an error if no swap event was found or decoded", () => {
            let activityWithoutSwap = JSON.parse(JSON.stringify(activity))
            activityWithoutSwap.outputs = []

            expect(() =>
                TransactionUtils.decodeSwapTransferAmounts(
                    decodedClauses,
                    activityWithoutSwap,
                ),
            ).toThrow("Could not find or decode swap event")
        })

        it("should throw an error if path inputs is invalid", () => {
            const clauseWithInvalidPath = [
                {
                    to: "0x0000000000000000000000000000456e65726779",
                    value: "0x1234",
                    data: "0x1352",
                    type: ClauseType.SWAP_VET_FOR_TOKENS,
                    path: ["0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997"],
                },
            ]
            expect(() =>
                TransactionUtils.decodeSwapTransferAmounts(
                    clauseWithInvalidPath,
                    activity,
                ),
            ).toThrow("Invalid swap clause path")
        })

        it("should throw an error if decodedSwaps length is invalid", () => {
            expect(() =>
                TransactionUtils.decodeSwapTransferAmounts(
                    decodedClauses,
                    activitySwapTokensForTokens,
                ),
            ).toThrow("Invalid swap event count, expected 1")
        })
        // Add more test cases for other edge cases and error cases...
    })

    describe("encodeTransferFungibleTokenClause", () => {
        it("should encode a transfer VET clause", () => {
            const to = "0x058D4C951AA24CA012cEf3408B259aC1C69D1258"
            const value = "1559"
            const tokenAddress = VET.address

            const result = {
                to,
                value: "0x617",
                data: "0x",
            }

            const encodedClause =
                TransactionUtils.encodeTransferFungibleTokenClause(
                    to,
                    value,
                    tokenAddress,
                )

            expect(encodedClause).toEqual(result)
        })

        it("should encode a fungible token transfer clause", () => {
            const to = "0x63792F9BAeF181e44Fc5F81918809FB98e4F71c5"
            const value = "216800000000000000000000"
            const tokenAddress = "0x5db3C8A942333f6468176a870dB36eEf120a34DC"

            const result = {
                to: tokenAddress,
                value: "0x0",
                data: "0xa9059cbb00000000000000000000000063792f9baef181e44fc5f81918809fb98e4f71c5000000000000000000000000000000000000000000002de8c065905eef800000",
            }

            const encodedClause =
                TransactionUtils.encodeTransferFungibleTokenClause(
                    to,
                    value,
                    tokenAddress,
                )

            expect(encodedClause).toEqual(result)
        })
    })

    describe("encodeTransferNonFungibleTokenClause", () => {
        it("should encode a transfer NFT clause", () => {
            const from = "0xCF130b42Ae31C4931298B4B1c0F1D974B8732957"
            const to = "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"
            const tokenId = 3605
            const nftContractAddress =
                "0xC8ebceCb1438b9A00eA1003c956C3e0b83aa0EC3"

            const result = {
                to: nftContractAddress,
                value: "0x0",
                data: "0x23b872dd000000000000000000000000cf130b42ae31c4931298b4b1c0f1d974b8732957000000000000000000000000f077b491b355e64048ce21e3a6fc4751eeea77fa0000000000000000000000000000000000000000000000000000000000000e15",
            }

            const encodedClause =
                TransactionUtils.encodeTransferNonFungibleTokenClause(
                    from,
                    to,
                    nftContractAddress,
                    tokenId,
                )

            expect(encodedClause).toEqual(result)
        })
    })
})

describe("toDelegation", () => {
    it("should create a new Transaction with reserved features set to 1", () => {
        const result = toDelegation({} as Transaction.Body)
        expect(result.body.reserved).toEqual({ features: 1 })
    })
})

describe("Decode Transfer Event", () => {
    it("should correctly decode NFT transfer events", () => {
        const decodedEvent = {
            from: "0x3ca43f476106ff42ec6209ee78129b62547570ff",
            to: "0xf6f50606d11cbfedb0da9ded07c554eb7f05fcd3",
            tokenId: "86328",
        }

        const eventObj = {
            address: "0xb1b9d40758cc3d90f1b2899dfb7a64e5d0235c61",
            data: "0x",
            meta: {
                blockID:
                    "0x00f162dc3d566f3d88329b1d46130dd7c6b5ce78307bd3d304f66b8cc6e986f9",
                blockNumber: 15819484,
                blockTimestamp: 1688718950,
                clauseIndex: 0,
                txID: "0x571e68f0fa31d324ca8926264e6ff745e3552ce9d504e68c50b15877517a21f7",
                txOrigin: "0x3ca43f476106ff42ec6209ee78129b62547570ff",
            },
            obsolete: false,
            topics: [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                "0x0000000000000000000000003ca43f476106ff42ec6209ee78129b62547570ff",
                "0x000000000000000000000000f6f50606d11cbfedb0da9ded07c554eb7f05fcd3",
                "0x0000000000000000000000000000000000000000000000000000000000015138",
            ],
        }

        const result = decodeTransferEvent(eventObj)
        expect(result).toEqual(decodedEvent)
    })

    it("should correctly decode Fungible Token transfer events", () => {
        const decodedEvent = {
            from: "0x85d10fff9cb9754851e38061bb113992f580e87b",
            to: "0x9a107a75cff525b033a3e53cadafe3d193b570ec",
            value: "42900631850968107846730",
        }

        const eventObj = {
            address: "0x0000000000000000000000000000456e65726779",
            data: "0x000000000000000000000000000000000000000000000915a5dd9b2a9ade0c4a",
            meta: {
                blockID:
                    "0x00f162e0980187cf922b8304f28512629c5fbbb3700eb22c6a1b7d5f4ee194ad",
                blockNumber: 15819488,
                blockTimestamp: 1688718990,
                clauseIndex: 0,
                txID: "0x6589353523483c1d0792703c8ab798cd92f347da0c65e26c83ab0650555e6a08",
                txOrigin: "0x85d10fff9cb9754851e38061bb113992f580e87b",
            },
            obsolete: false,
            topics: [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                "0x00000000000000000000000085d10fff9cb9754851e38061bb113992f580e87b",
                "0x0000000000000000000000009a107a75cff525b033a3e53cadafe3d193b570ec",
            ],
        }

        const result = decodeTransferEvent(eventObj)
        expect(result).toEqual(decodedEvent)
    })

    describe("decodeNonFungibleTokenTransferClause", () => {
        it("should return decoded non fungible token transfer data if data starts with NFT_TRANSFER_SIG", () => {
            const data =
                "0x23b872dd000000000000000000000000cf130b42ae31c4931298b4b1c0f1d974b8732957000000000000000000000000f077b491b355e64048ce21e3a6fc4751eeea77fa0000000000000000000000000000000000000000000000000000000000000e15"
            expect(
                TransactionUtils.decodeNonFungibleTokenTransferClause({
                    data,
                    to: "0xC8ebceCb1438b9A00eA1003c956C3e0b83aa0EC3",
                    value: "0x",
                }),
            ).toEqual({
                from: "0xcf130b42ae31c4931298b4b1c0f1d974b8732957",
                to: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
                tokenId: "3605",
            })
        })
        it("should return null if data does not start with NFT_TRANSFER_SIG", () => {
            const data = "0x123"
            expect(
                TransactionUtils.decodeNonFungibleTokenTransferClause({
                    data,
                    to: "0x",
                    value: "0x",
                }),
            ).toBe(null)
        })
        it("should return null if data is empty", () => {
            const data = ""
            expect(
                TransactionUtils.decodeNonFungibleTokenTransferClause({
                    data,
                    to: "0x",
                    value: "0x",
                }),
            ).toBe(null)
        })
        it("should log error when fails to decode non fungible token transfer clause", () => {
            const debugSpy = jest.spyOn(logger, "debug")

            const clause = {
                data: "0x23b872dd000000000000000000000000cf130b42ae31c4931298b4b1c0f1d974b87329570000000000000000000000",
                to: "0x",
                value: "0x",
            }

            expect(
                TransactionUtils.decodeNonFungibleTokenTransferClause(clause),
            ).toBe(null)

            expect(debugSpy).toHaveBeenCalledWith(
                "Failed to decode parameters",
                expect.any(Error),
            )

            // Restore the original function
            debugSpy.mockRestore()
        })
    })
})
