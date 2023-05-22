import { ClauseType, Token } from "~Model"
import TransactionUtils from "."
import * as logger from "~Common/Logger/Logger"

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

    describe("interpretClauses", () => {
        it("should interpret clauses correctly", () => {
            const clause = [
                {
                    to: SHA_TOKEN.address,
                    value: "0x",
                    data: "0xa9059cbb00000000000000000000000063792f9baef181e44fc5f81918809fb98e4f71c50000000000000000000000000000000000000000000215a1794693c777000000",
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
            ]
            expect(TransactionUtils.interpretClauses(clause, tokens)).toEqual(
                expected,
            )
        })
        it("should interpret clauses correctly with VET transfer", () => {
            const clause = [
                {
                    to: "0x63792f9baef181e44fc5f81918809fb98e4f71c5",
                    value: "0x124567",
                    data: "0xa9059cbb00000000000000000000000063792f9baef181e44fc5f81918809fb98e4f71c50000000000000000000000000000000000000000000215a1794693c777000000",
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
