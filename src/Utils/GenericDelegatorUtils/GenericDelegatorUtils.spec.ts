import { ABIContract, Address, Clause, Transaction, TransactionClause, Units, VET } from "@vechain/sdk-core"
import { TESTNET_URL, ThorClient } from "@vechain/sdk-network"
import { ethers } from "ethers"
import { abis, B3TR } from "~Constants"
import BigNutils from "~Utils/BigNumberUtils"
import {
    GenericDelegatorTransactionValidationResultInvalid,
    validateGenericDelegatorTx,
    validateGenericDelegatorTxSmartAccount,
} from "./GenericDelegatorUtils"
import { SimpleAccountABI } from "../../VechainWalletKit/utils/abi"

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

const simpleAccountIface = new ethers.utils.Interface(SimpleAccountABI)

const constructExecuteWithAuthorization = (
    smartAccountAddress: string,
    to: string,
    value: string = "0",
    data: string = "0x",
) => {
    const executeData = simpleAccountIface.encodeFunctionData("executeWithAuthorization", [
        to,
        value,
        data,
        0, // validAfter
        0, // validBefore
        "0x", // signature placeholder
    ])
    return {
        to: smartAccountAddress,
        value: "0",
        data: executeData,
    }
}

const constructExecuteBatchWithAuthorization = (
    smartAccountAddress: string,
    addresses: string[],
    values: string[],
    datas: string[],
) => {
    const executeData = simpleAccountIface.encodeFunctionData("executeBatchWithAuthorization", [
        addresses,
        values,
        datas,
        0, // validAfter
        0, // validBefore
        "0x0000000000000000000000000000000000000000000000000000000000000000", // nonce
        "0x", // signature placeholder
    ])
    return {
        to: smartAccountAddress,
        value: "0",
        data: executeData,
    }
}

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
            expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe("CLAUSES_DIFF")
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
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe("OVER_THRESHOLD")
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
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe("SENT_DATA")
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
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe("NOT_ERC20_TRANSFER")
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
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe("OVER_THRESHOLD")
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

    describe("validateGenericDelegatorTxSmartAccount", () => {
        const depositAccount = ethers.Wallet.createRandom().address
        const smartAccountAddress = ethers.Wallet.createRandom().address

        describe("VET delegation", () => {
            it("should return false if no delegation fee clause is found", async () => {
                const userTransaction = constructVETTransfer()
                const smartAccountTx = await constructTx([
                    constructExecuteWithAuthorization(
                        smartAccountAddress,
                        userTransaction.to!,
                        userTransaction.value!,
                        userTransaction.data!,
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "VET",
                    BigNutils("100"),
                    depositAccount,
                )

                expect(result.valid).toBe(false)
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe(
                    "NO_DELEGATION_FEE_CLAUSE",
                )
            })

            it("should return false if the difference between the sent value and the estimate is > 10%", async () => {
                const userTransaction = constructVETTransfer()
                const vetFeeClause = constructVETTransfer(depositAccount, VET.of(100, Units.wei))
                const smartAccountTx = await constructTx([
                    constructExecuteBatchWithAuthorization(
                        smartAccountAddress,
                        [userTransaction.to!, vetFeeClause.to!],
                        [userTransaction.value!, vetFeeClause.value!],
                        [userTransaction.data!, vetFeeClause.data!],
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "VET",
                    BigNutils("89"), // 11% difference
                    depositAccount,
                )

                expect(result.valid).toBe(false)
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe("OVER_THRESHOLD")
            })

            it("should return true if all checks are ok with executeBatchWithAuthorization", async () => {
                const userTransaction = constructVETTransfer()
                const vetFeeClause = constructVETTransfer(depositAccount, VET.of(100, Units.wei))
                const smartAccountTx = await constructTx([
                    constructExecuteBatchWithAuthorization(
                        smartAccountAddress,
                        [userTransaction.to!, vetFeeClause.to!],
                        [userTransaction.value!, vetFeeClause.value!],
                        [userTransaction.data!, vetFeeClause.data!],
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "VET",
                    BigNutils("99"),
                    depositAccount,
                )

                expect(result.valid).toBe(true)
            })

            it("should return true if all checks are ok with executeWithAuthorization", async () => {
                const vetFeeClause = constructVETTransfer(depositAccount, VET.of(100, Units.wei))
                const smartAccountTx = await constructTx([
                    constructExecuteWithAuthorization(
                        smartAccountAddress,
                        vetFeeClause.to!,
                        vetFeeClause.value!,
                        vetFeeClause.data!,
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "VET",
                    BigNutils("99"),
                    depositAccount,
                )

                expect(result.valid).toBe(true)
            })
        })

        describe("B3TR delegation", () => {
            it("should return false if no delegation fee clause is found", async () => {
                const userTransaction = constructVETTransfer()
                const smartAccountTx = await constructTx([
                    constructExecuteWithAuthorization(
                        smartAccountAddress,
                        userTransaction.to!,
                        userTransaction.value!,
                        userTransaction.data!,
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "B3TR",
                    BigNutils("100"),
                    depositAccount,
                )

                expect(result.valid).toBe(false)
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe(
                    "NO_DELEGATION_FEE_CLAUSE",
                )
            })

            it("should return false if the signature is wrong", async () => {
                // This test demonstrates that clauses with invalid data (not ERC20 transfers)
                // are filtered out during delegation fee clause detection
                const userTransaction = constructVETTransfer()
                const validTransferToDeposit = constructTokenTransfer(depositAccount, VET.of(100, Units.wei))
                const smartAccountTx = await constructTx([
                    constructExecuteWithAuthorization(
                        smartAccountAddress,
                        userTransaction.to!,
                        userTransaction.value!,
                        userTransaction.data!,
                    ),
                    { ...validTransferToDeposit, data: "0x12345678" }, // Invalid data but to deposit account
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "B3TR",
                    BigNutils("100"),
                    depositAccount,
                )

                expect(result.valid).toBe(false)
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe(
                    "NO_DELEGATION_FEE_CLAUSE",
                )
            })

            it("should return false if the difference between the sent value and the estimate is > 10%", async () => {
                const userTransaction = constructVETTransfer()
                const tokenFeeClause = constructTokenTransfer(depositAccount, VET.of(100, Units.wei))
                const smartAccountTx = await constructTx([
                    constructExecuteBatchWithAuthorization(
                        smartAccountAddress,
                        [userTransaction.to!, B3TR.address],
                        [userTransaction.value!, "0"],
                        [userTransaction.data!, tokenFeeClause.data!],
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "B3TR",
                    BigNutils("89"), // 11% difference
                    depositAccount,
                )

                expect(result.valid).toBe(false)
                expect((result as GenericDelegatorTransactionValidationResultInvalid).reason).toBe("OVER_THRESHOLD")
            })

            it("should return true if all checks are ok with executeBatchWithAuthorization", async () => {
                const userTransaction = constructVETTransfer()
                const tokenFeeClause = constructTokenTransfer(depositAccount, VET.of(100, Units.wei))
                const smartAccountTx = await constructTx([
                    constructExecuteBatchWithAuthorization(
                        smartAccountAddress,
                        [userTransaction.to!, B3TR.address],
                        [userTransaction.value!, "0"],
                        [userTransaction.data!, tokenFeeClause.data!],
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "B3TR",
                    BigNutils("99"),
                    depositAccount,
                )

                expect(result.valid).toBe(true)
            })

            it("should return true if all checks are ok with executeWithAuthorization", async () => {
                const tokenFeeClause = constructTokenTransfer(depositAccount, VET.of(100, Units.wei))
                const smartAccountTx = await constructTx([
                    constructExecuteWithAuthorization(smartAccountAddress, B3TR.address, "0", tokenFeeClause.data!),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "B3TR",
                    BigNutils("99"),
                    depositAccount,
                )

                expect(result.valid).toBe(true)
            })
        })

        describe("mixed transactions", () => {
            it("should handle smart account transactions mixed with regular clauses", async () => {
                const regularClause = constructVETTransfer(depositAccount, VET.of(100, Units.wei))
                const userTransaction = constructVETTransfer()
                const smartAccountTx = await constructTx([
                    regularClause,
                    constructExecuteWithAuthorization(
                        smartAccountAddress,
                        userTransaction.to!,
                        userTransaction.value!,
                        userTransaction.data!,
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "VET",
                    BigNutils("99"),
                    depositAccount,
                )

                expect(result.valid).toBe(true)
            })

            it("should validate multiple smart account clauses correctly", async () => {
                const userTransaction1 = constructVETTransfer()
                const userTransaction2 = constructVETTransfer()
                const vetFeeClause = constructVETTransfer(depositAccount, VET.of(100, Units.wei))
                const smartAccountTx = await constructTx([
                    constructExecuteWithAuthorization(
                        smartAccountAddress,
                        userTransaction1.to!,
                        userTransaction1.value!,
                        userTransaction1.data!,
                    ),
                    constructExecuteWithAuthorization(
                        smartAccountAddress,
                        userTransaction2.to!,
                        userTransaction2.value!,
                        userTransaction2.data!,
                    ),
                    constructExecuteWithAuthorization(
                        smartAccountAddress,
                        vetFeeClause.to!,
                        vetFeeClause.value!,
                        vetFeeClause.data!,
                    ),
                ])

                const result = await validateGenericDelegatorTxSmartAccount(
                    smartAccountTx,
                    "VET",
                    BigNutils("99"),
                    depositAccount,
                )

                expect(result.valid).toBe(true)
            })
        })
    })
})
