import { ABIContract, Address, Clause, Transaction, TransactionClause, Units, VET } from "@vechain/sdk-core"
import { TESTNET_URL, ThorClient } from "@vechain/sdk-network"
import { ethers } from "ethers"
import { validateGenericDelegatorTx } from "./GenericDelegatorUtils"
import BigNutils from "~Utils/BigNumberUtils"
import { abis, B3TR } from "~Constants"

const thorClient = ThorClient.at(TESTNET_URL)

jest.mock("~Networking/GenericDelegator")

const constructTx = async (clauses: TransactionClause[]) =>
    thorClient.transactions.buildTransactionBody(clauses, 1000000).then(u => Transaction.of(u))

const constructVETTransfer = (address = ethers.Wallet.createRandom().address, amount = VET.of(1, Units.wei)) =>
    Clause.transferVET(Address.of(address), amount)

const constructTokenTransfer = (address = ethers.Wallet.createRandom().address, amount = VET.of(1, Units.wei)) =>
    Clause.callFunction(
        Address.of(B3TR.address),
        ABIContract.ofAbi([abis.VIP180.transfer as any]).getFunction("transfer"),
        [address, amount.wei.toString()],
    )

const constructTokenApprove = (address = ethers.Wallet.createRandom().address, amount = VET.of(1, Units.wei)) =>
    Clause.callFunction(
        Address.of(B3TR.address),
        ABIContract.ofAbi([abis.VIP180.approve as any]).getFunction("approve"),
        [address, amount.wei.toString()],
    )

describe("GenericDelegatorUtils", () => {
    describe("validateGenericDelegatorTx", () => {
        it("should return false if more than 1 clause is added", async () => {
            const result = await validateGenericDelegatorTx(
                await constructTx([constructVETTransfer()]),
                await constructTx([constructVETTransfer(), constructVETTransfer(), constructVETTransfer()]),
                "VET",
                BigNutils("0"),
            )
            expect(result.valid).toBe(false)
            expect(result.reason).toBe("CLAUSES_DIFF")
        })
        describe("VET", () => {
            it("should return false if the difference between the sent value and the estimate is > 10%", async () => {
                const depositAccount = ethers.Wallet.createRandom().address
                const toAccount = ethers.Wallet.createRandom().address
                const result = await validateGenericDelegatorTx(
                    await constructTx([constructVETTransfer(toAccount)]),
                    await constructTx([
                        constructVETTransfer(toAccount),
                        constructVETTransfer(depositAccount, VET.of(100, Units.wei)),
                    ]),
                    "VET",
                    BigNutils("89"),
                )
                expect(result.valid).toBe(false)
                expect(result.reason).toBe("OVER_THRESHOLD")
            })
            it("should return false if it's trying to send some data", async () => {
                const depositAccount = ethers.Wallet.createRandom().address
                const toAccount = ethers.Wallet.createRandom().address
                const result = await validateGenericDelegatorTx(
                    await constructTx([constructVETTransfer(toAccount)]),
                    await constructTx([
                        constructVETTransfer(toAccount),
                        { ...constructVETTransfer(depositAccount, VET.of(100, Units.wei)), data: "0x001100" },
                    ]),
                    "VET",
                    BigNutils("99"),
                )
                expect(result.valid).toBe(false)
                expect(result.reason).toBe("SENT_DATA")
            })
            it("should return true if all the checks are ok", async () => {
                const depositAccount = ethers.Wallet.createRandom().address
                const toAccount = ethers.Wallet.createRandom().address
                const result = await validateGenericDelegatorTx(
                    await constructTx([constructVETTransfer(toAccount)]),
                    await constructTx([
                        constructVETTransfer(toAccount),
                        constructVETTransfer(depositAccount, VET.of(100, Units.wei)),
                    ]),
                    "VET",
                    BigNutils("99"),
                )
                expect(result.valid).toBe(true)
            })
        })
        describe("B3TR", () => {
            it("should return false if the signature is wrong", async () => {
                const toAccount = ethers.Wallet.createRandom().address
                const result = await validateGenericDelegatorTx(
                    await constructTx([constructVETTransfer(toAccount)]),
                    await constructTx([
                        constructVETTransfer(toAccount),
                        constructTokenApprove(ethers.Wallet.createRandom().address),
                    ]),
                    "B3TR",
                    BigNutils("0"),
                )
                expect(result.valid).toBe(false)
                expect(result.reason).toBe("NOT_ERC20_TRANSFER")
            })
            it("should return false if the difference between the sent value and the estimate is > 10%", async () => {
                const depositAccount = ethers.Wallet.createRandom().address
                const toAccount = ethers.Wallet.createRandom().address
                const result = await validateGenericDelegatorTx(
                    await constructTx([constructVETTransfer(toAccount)]),
                    await constructTx([
                        constructVETTransfer(toAccount),
                        constructTokenTransfer(depositAccount, VET.of(100, Units.wei)),
                    ]),
                    "B3TR",
                    BigNutils("89"),
                )
                expect(result.valid).toBe(false)
                expect(result.reason).toBe("OVER_THRESHOLD")
            })
            it("should return true if all the checks are ok", async () => {
                const depositAccount = ethers.Wallet.createRandom().address
                const toAccount = ethers.Wallet.createRandom().address
                const result = await validateGenericDelegatorTx(
                    await constructTx([constructVETTransfer(toAccount)]),
                    await constructTx([
                        constructVETTransfer(toAccount),
                        constructTokenTransfer(depositAccount, VET.of(100, Units.wei)),
                    ]),
                    "B3TR",
                    BigNutils("99"),
                )
                expect(result.valid).toBe(true)
            })
        })
    })
})
