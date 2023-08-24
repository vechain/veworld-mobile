import { TestHelpers } from "~Test"
import LedgerUtils from "./LedgerUtils"
import { defaultMainNetwork, LEDGER_ERROR_CODES } from "~Constants"
import { BleError, BleErrorCodeMessageMapping } from "react-native-ble-plx"
import { DisconnectedDeviceDuringOperation } from "@ledgerhq/errors"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

const withTransport: (func: (t: BleTransport) => any) => any = async func => {
    return await func(TestHelpers.data.mockedTransport)
}

describe("LedgerUtils", () => {
    describe("ledgerErrorHandler", () => {
        it("0x6d02 - should return NO_VET_APP", () => {
            const error = new Error("0x6d02")
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.NO_VET_APP,
            )
        })
        it("0x6a15 - should return NO_VET_APP", () => {
            const error = new Error("0x6a15")
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.NO_VET_APP,
            )
        })
        it("BleError - should return OFF_OR_LOCKED", () => {
            const error = new BleError("BleError", {
                0: "UnknownError",
            } as BleErrorCodeMessageMapping)
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.OFF_OR_LOCKED,
            )
        })

        it("0x6b0c - should return OFF_OR_LOCKED", () => {
            const error = new Error("0x6b0c")
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.OFF_OR_LOCKED,
            )
        })
        it("0x5515 - should return OFF_OR_LOCKED", () => {
            const error = new Error("0x5515")
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.OFF_OR_LOCKED,
            )
        })
        it("busy - should return OFF_OR_LOCKED", () => {
            const error = new Error("busy")
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.OFF_OR_LOCKED,
            )
        })
        it("Disconnected - should return DISCONNECTED", () => {
            const error = new DisconnectedDeviceDuringOperation("Disconnected")
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.DISCONNECTED,
            )
        })
        it("Unknown Error - should return UNKNOWN", () => {
            const error = new Error("Unknown Error")
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.UNKNOWN,
            )
        })

        it("random string should return unknown", () => {
            expect(LedgerUtils.ledgerErrorHandler("hello world")).toBe(
                LEDGER_ERROR_CODES.UNKNOWN,
            )
        })

        it("not error or string should return unknown", () => {
            expect(LedgerUtils.ledgerErrorHandler({})).toBe(
                LEDGER_ERROR_CODES.UNKNOWN,
            )
        })

        it("LEDGER_ERROR_CODES should return LEDGER_ERROR_CODES", () => {
            expect(
                LedgerUtils.ledgerErrorHandler(LEDGER_ERROR_CODES.DISCONNECTED),
            ).toBe(LEDGER_ERROR_CODES.DISCONNECTED)
        })

        it("0x6985 - should return USER_REJECTED", () => {
            const error = new Error("0x6985")
            expect(LedgerUtils.ledgerErrorHandler(error)).toBe(
                LEDGER_ERROR_CODES.USER_REJECTED,
            )
        })
    })

    describe("checkLedgerConnection", () => {
        // TODO (Erik) (https://github.com/vechainfoundation/veworld-mobile/issues/776) mock transport and test more
        it("should not throw", async () => {
            await LedgerUtils.verifyTransport(withTransport)
        })
    })

    describe("signCertificate", () => {
        // TODO (https://github.com/vechainfoundation/veworld-mobile/issues/776) mock transport and test more
        // it("should works as expected", async () => {
        //     await LedgerUtils.signCertificate(
        //         0,
        //         TestHelpers.data.mockedCertificate,
        //         { ...TestHelpers.data.ledgerDevice },
        //         TestHelpers.data.mockedTransport,
        //     )
        // })

        it("should throw when device and ledgerApp mismatch", async () => {
            const signCertificateCall = async () =>
                await LedgerUtils.signCertificate(
                    0,
                    TestHelpers.data.mockedCertificate,
                    { ...TestHelpers.data.ledgerDevice, rootAddress: "dddd" },
                    withTransport,
                )

            const res = await signCertificateCall()

            expect(res).toEqual({
                payload: LEDGER_ERROR_CODES.UNKNOWN,
                success: false,
            })
        })
    })

    describe("signTransaction", () => {
        // TODO (Erik) (https://github.com/vechainfoundation/veworld-mobile/issues/776) mock transport and test more
        // Do not work since we switched from vet app to transport
        // it("should works as expected", async () => {
        //     await LedgerUtils.signTransaction(
        //         0,
        //         TestHelpers.data.vetTransaction1,
        //         { ...TestHelpers.data.ledgerDevice },
        //         TestHelpers.data.mockedTransport,
        //         () => {},
        //     )
        // })

        it("should throw when device and ledgerApp mismatch", async () => {
            const signCertificateCall = async () =>
                await LedgerUtils.signTransaction(
                    0,
                    TestHelpers.data.vetTransaction1,
                    { ...TestHelpers.data.ledgerDevice, rootAddress: "dddd" },
                    withTransport,
                    () => {},
                )
            const res = await signCertificateCall()

            expect(res).toEqual({
                payload: LEDGER_ERROR_CODES.UNKNOWN,
                success: false,
            })
        })
    })

    describe("getAccountsWithBalances", () => {
        it("should works as expected", async () => {
            await LedgerUtils.getAccountsWithBalances(
                { ...TestHelpers.data.mockLedgerAccount },
                defaultMainNetwork,
                2,
            )
        })

        it("should throw if < 1 accounts", async () => {
            const getAccountsWithBalancesCall = async () =>
                await LedgerUtils.getAccountsWithBalances(
                    { ...TestHelpers.data.mockLedgerAccount },
                    defaultMainNetwork,
                    0,
                )
            expect(getAccountsWithBalancesCall).rejects.toThrow(
                "Must get at least 1 account",
            )
        })

        it("should throw when !rootAccount.publicKey", async () => {
            const getAccountsWithBalancesCall = async () =>
                await LedgerUtils.getAccountsWithBalances(
                    { ...TestHelpers.data.mockLedgerAccount, publicKey: "" },
                    defaultMainNetwork,
                    1,
                )
            expect(getAccountsWithBalancesCall).rejects.toThrow(
                "Failed to get public key/ chaincode",
            )
        })
        it("should throw when !rootAccount.chainCode", async () => {
            const getAccountsWithBalancesCall = async () =>
                await LedgerUtils.getAccountsWithBalances(
                    {
                        ...TestHelpers.data.mockLedgerAccount,
                        chainCode: undefined,
                    },
                    defaultMainNetwork,
                    1,
                )
            expect(getAccountsWithBalancesCall).rejects.toThrow(
                "Failed to get public key/ chaincode",
            )
        })
    })
})
