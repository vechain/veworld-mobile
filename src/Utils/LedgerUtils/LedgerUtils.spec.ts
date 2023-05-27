import { TestHelpers } from "~Test"
import LedgerUtils from "./LedgerUtils"
import { defaultMainNetwork } from "~Common/Constant/Thor/ThorConstants"

describe("LedgerUtils", () => {
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
