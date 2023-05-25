import { ClauseType, Token } from "~Model"
import TransactionUtils from "."
import * as logger from "~Common/Logger/Logger"
import { toDelegation } from "./TransactionUtils"
import { Transaction } from "thor-devkit"

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
})

describe("toDelegation", () => {
    it("should create a new Transaction with reserved features set to 1", () => {
        const result = toDelegation({} as Transaction.Body)
        expect(result.body.reserved).toEqual({ features: 1 })
    })
})
