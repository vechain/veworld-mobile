import { Transaction } from "thor-devkit"

const vetTransactionBody1: Transaction.Body = {
    chainTag: 39,
    blockRef: "0x00cfde3b1f486b72",
    expiration: 18,
    clauses: [
        {
            to: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68",
            value: "300000000000000000000",
            data: "0x",
        },
    ],
    gasPriceCoef: 0,
    gas: 21000,
    dependsOn: null,
    nonce: "0xc64a13b1",
}

export const vetTransaction1: Transaction = new Transaction(vetTransactionBody1)
