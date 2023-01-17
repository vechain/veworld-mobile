import { token1, token2 } from "../../../test/helpers/data/tokens"

import { abis } from "../../constants/Thor/ThorConstants"
import { newAccountVisitor } from "@vechain/connex-framework/dist/account-visitor"
import { Token } from "~Model/Token"
import TransactionUtils from "./TransactionUtils"
import { address } from "thor-devkit"
import AddressUtils from "../AddressUtils"
import Counter from "../../../test/helpers/data/ContractAbi/Counter.json"
import { VET } from "../../constants/Token/TokenConstants"

const tokens = [token1, VET]

const receiver1 = address.toChecksumed(
    "0x0F872421Dc479F3c11eDd89512731814D0598dB5",
)

const validateVetTransfer = (interpretation: any) => {
    expect(interpretation.type).toBe("transfer")
    expect(interpretation.tokenSymbol).toBe(VET.symbol)
    expect(interpretation.amount).toBe(1)
    expect(
        AddressUtils.compareAddresses(interpretation.to, receiver1),
    ).toBeTruthy()
    expect(interpretation.comment).toBe("Send VET")
    expect(interpretation.value).toBe("0x1")
}

const validateKnownTokenTransfer = (interpretation: any) => {
    expect(interpretation.type).toBe("transfer")
    expect(interpretation.tokenSymbol).toBe(token1.symbol)
    expect(interpretation.amount).toBe(100)
    // @ts-ignore
    expect(address.toChecksumed(interpretation.to)).toBe(receiver1)
    expect(interpretation.comment).toBe("Send a token")
    expect(interpretation.value).toBe("0")
}

const validateUnknownTokenTransfer = (interpretation: any) => {
    expect(interpretation.type).toBe("contract_call")
    expect(interpretation.tokenSymbol).toBe(undefined)
    expect(interpretation.amount).toBe(undefined)
    // @ts-ignore
    expect(
        AddressUtils.compareAddresses(interpretation.to, token2.address),
    ).toBeTruthy()
    expect(interpretation.comment).toBe("Send a token")
    expect(interpretation.value).toBe("0")
}

const validateDeployContract = (interpretation: any) => {
    expect(interpretation.type).toBe("deploy_contract")
    expect(interpretation.tokenSymbol).toBe(undefined)
    expect(interpretation.amount).toBe(undefined)
    expect(interpretation.to).toBe(null)
    expect(interpretation.comment).toBe("Deploy a contract")
    expect(interpretation.value).toBe("0x")
}

const buildTransferClause = (token: Token, to: string, amount: string) => {
    // @ts-ignore
    const clause = newAccountVisitor(undefined, token.address)
        .method(abis.vip180.transfer)
        .asClause(to, amount)

    return { ...clause, comment: "Send a token" }
}

const buildVetTransfer = (to: string, amount: string) => {
    return {
        comment: "Send VET",
        value: amount,
        data: "0x",
        to: to,
    }
}

describe("Interpret Transaction clauses", () => {
    test("Interpret a know token", () => {
        const clause = buildTransferClause(token1, receiver1, "100")
        const txMessage: Connex.Vendor.TxMessage = [clause]

        const interpretation = TransactionUtils.interpretClauses(
            txMessage,
            tokens,
        )

        expect(interpretation.length).toBe(1)
        validateKnownTokenTransfer(interpretation[0])
    })

    test("Interpret an unknown token", () => {
        const clause = buildTransferClause(token2, receiver1, "100")
        const txMessage: Connex.Vendor.TxMessage = [clause]

        const interpretation = TransactionUtils.interpretClauses(
            txMessage,
            tokens,
        )

        expect(interpretation.length).toBe(1)
        validateUnknownTokenTransfer(interpretation[0])
    })

    test("Deploy a contract", () => {
        const txMessage: Connex.Vendor.TxMessage = [
            {
                data: Counter.bytecode,
                value: "0x",
                to: null,
                comment: "Deploy a contract",
            },
        ]

        const interpretation = TransactionUtils.interpretClauses(
            txMessage,
            tokens,
        )

        expect(interpretation.length).toBe(1)
        validateDeployContract(interpretation[0])
    })

    test("VET Transfer", () => {
        const clause = buildVetTransfer(receiver1, "0x1")
        const txMessage: Connex.Vendor.TxMessage = [clause]

        const interpretation = TransactionUtils.interpretClauses(
            txMessage,
            tokens,
        )

        expect(interpretation.length).toBe(1)
        validateVetTransfer(interpretation[0])
    })

    test("Several clauses test", () => {
        const sendVetClause = buildVetTransfer(receiver1, "0x1")
        const tokenClause = buildTransferClause(token1, receiver1, "100")
        const unknownTokenClause = buildTransferClause(token2, receiver1, "100")
        const deployContractClause = {
            data: Counter.bytecode,
            value: "0x",
            to: null,
            comment: "Deploy a contract",
        }

        const txMessage: Connex.Vendor.TxMessage = [
            deployContractClause,
            tokenClause,
            unknownTokenClause,
            sendVetClause,
        ]

        const interpretation = TransactionUtils.interpretClauses(
            txMessage,
            tokens,
        )

        expect(interpretation.length).toBe(4)
        validateVetTransfer(interpretation[0])
        validateDeployContract(interpretation[1])
        validateKnownTokenTransfer(interpretation[2])
        validateUnknownTokenTransfer(interpretation[3])
    })

    test("Token Transfer and VET Transfer in 1 clause", () => {
        const knownTokenClause = buildTransferClause(token1, receiver1, "100")

        const txMessage: Connex.Vendor.TxMessage = [
            { ...knownTokenClause, value: "0x1" },
        ]

        const interpretation = TransactionUtils.interpretClauses(
            txMessage,
            tokens,
        )

        //We should have 2 clauses since it has data and a value
        expect(interpretation.length).toBe(2)

        //Validate first clause is a VET Transfer
        expect(interpretation[0].type).toBe("transfer")
        expect(interpretation[0].tokenSymbol).toBe(VET.symbol)
        expect(interpretation[0].amount).toBe(1)

        //Validate second clause is a token transfer
        expect(interpretation[1].type).toBe("transfer")
        expect(interpretation[1].tokenSymbol).toBe(token1.symbol)
        expect(interpretation[1].amount).toBe(100)
    })

    test("Contract Call and VET Transfer in 1 clause", () => {
        const unknownTokenClause = buildTransferClause(token2, receiver1, "100")

        const txMessage: Connex.Vendor.TxMessage = [
            { ...unknownTokenClause, value: "0x1" },
        ]

        const interpretation = TransactionUtils.interpretClauses(
            txMessage,
            tokens,
        )

        //We should have 2 clauses since it has data and a value
        expect(interpretation.length).toBe(2)

        //Validate first clause is a VET Transfer
        expect(interpretation[0].type).toBe("transfer")
        expect(interpretation[0].tokenSymbol).toBe(VET.symbol)
        expect(interpretation[0].amount).toBe(1)

        //Validate second clause is a contract call
        expect(interpretation[1].type).toBe("contract_call")
        expect(interpretation[1].tokenSymbol).toBe(undefined)
    })

    test("Deploy contract and VET Transfer in 1 clause", () => {
        const txMessage: Connex.Vendor.TxMessage = [
            {
                data: Counter.bytecode,
                to: null,
                comment: "Deploy a contract",
                value: "0x1",
            },
        ]

        const interpretation = TransactionUtils.interpretClauses(
            txMessage,
            tokens,
        )

        //We should have 2 clauses since it has data and a value
        expect(interpretation.length).toBe(2)

        //Validate first clause is a VET Transfer
        expect(interpretation[0].type).toBe("transfer")
        expect(interpretation[0].tokenSymbol).toBe(VET.symbol)
        expect(interpretation[0].amount).toBe(1)

        //Validate second clause is a contract call
        expect(interpretation[1].type).toBe("deploy_contract")
        expect(interpretation[1].tokenSymbol).toBe(undefined)
    })
})
