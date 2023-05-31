import { TestHelpers } from "~Test"
import LedgerUtils from "./LedgerUtils"
import { defaultMainNetwork } from "~Common/Constant/Thor/ThorConstants"
import { LEDGER_ERROR_CODES } from "~Common"
import { BleError } from "react-native-ble-plx"
import { DisconnectedDeviceDuringOperation } from "@ledgerhq/errors"

const successCallback = jest.fn()
const errorCallback = jest.fn()

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
            } as any)
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
    })

    describe("checkLedgerConnection", () => {
        //TODO: mock transport and test more
        it("should not throw", async () => {
            await LedgerUtils.checkLedgerConnection({
                transport: TestHelpers.data.mockedTransport,
                successCallback,
                errorCallback,
            })
        })
    })

    describe("signCertificate", () => {
        it("should works as expected", async () => {
            await LedgerUtils.signCertificate(
                0,
                TestHelpers.data.mockedCertificate,
                { ...TestHelpers.data.ledgerDevice },
                TestHelpers.data.mockLedgerApp,
            )
        })

        it("should throw when device and ledgerApp mismatch", async () => {
            const signCertificateCall = async () =>
                await LedgerUtils.signCertificate(
                    0,
                    TestHelpers.data.mockedCertificate,
                    { ...TestHelpers.data.ledgerDevice, rootAddress: "dddd" },
                    TestHelpers.data.mockLedgerApp,
                )
            expect(signCertificateCall).rejects.toThrow(
                "Failed to sign the message",
            )
        })
    })

    describe("signTransaction", () => {
        it("should works as expected", async () => {
            await LedgerUtils.signTransaction(
                0,
                TestHelpers.data.vetTransaction1,
                { ...TestHelpers.data.ledgerDevice },
                TestHelpers.data.mockLedgerApp,
                () => {},
            )
        })

        it("should throw when device and ledgerApp mismatch", async () => {
            const signCertificateCall = async () =>
                await LedgerUtils.signTransaction(
                    0,
                    TestHelpers.data.vetTransaction1,
                    { ...TestHelpers.data.ledgerDevice, rootAddress: "dddd" },
                    TestHelpers.data.mockLedgerApp,
                    () => {},
                )
            expect(signCertificateCall).rejects.toThrow(
                "Failed to sign the message",
            )
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
