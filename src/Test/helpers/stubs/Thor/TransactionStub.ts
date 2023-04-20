import { connexTransactioReceiptStub, connexTransactionStub } from "../../data"
const existingTxId = connexTransactionStub.id
/**
 * Mocked transaction stub of Connex.Thor
 * Originally create a visitor to the transaction specified by the given id
 * @param id
 */
export function transactionStub(txId: string): Connex.Thor.Transaction.Visitor {
    return {
        id: txId,
        allowPending: () => {
            throw new Error("not implemented")
        },
        get: () =>
            Promise.resolve(
                txId === existingTxId ? connexTransactionStub : null,
            ),
        getReceipt: () =>
            Promise.resolve(
                txId === existingTxId ? connexTransactioReceiptStub : null,
            ),
    }
}
