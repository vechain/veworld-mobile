import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { chainTagToGenesisId, DIRECTIONS } from "~Constants"
import { ActivityStatus, ActivityType } from "~Model"
import { getDestinationAddressFromClause } from "~Utils/ActivityUtils/ActivityUtils"
import { createPendingTransferActivityFromTx } from "./ActivityHelpers"
import { getAmountFromClause } from "~Utils/TransactionUtils/TransactionUtils"
import { TestHelpers } from "~Test"

const { vetTransaction1 } = TestHelpers.data

const toSignedTx = (tx: Transaction) => {
    const randomWallet = ethers.Wallet.createRandom()
    return tx.sign(Buffer.from(randomWallet.privateKey.slice(2), "hex"))
}

describe("createPendingTransferActivityFromTx", () => {
    it("Should return a pending transfer activity", async () => {
        const signed = toSignedTx(vetTransaction1)
        const activity = createPendingTransferActivityFromTx(signed)
        const amount = getAmountFromClause(signed.body.clauses[0])
        expect(activity).toStrictEqual({
            from: signed.origin?.toString() ?? "",
            to: signed.body.clauses.map((clause: TransactionClause) => getDestinationAddressFromClause(clause) ?? ""),
            id: signed.id.toString() ?? "",
            txId: signed.id.toString() ?? "",
            genesisId: chainTagToGenesisId[signed.body.chainTag],
            gasUsed: Number(signed.body.gas),
            clauses: signed.body.clauses,
            delegated: signed.isDelegated,
            status: ActivityStatus.PENDING,
            isTransaction: true,
            timestamp: expect.any(Number),
            gasPayer: (signed.isDelegated ? signed.gasPayer?.toString() : signed.origin?.toString()) ?? "",
            blockNumber: 0,
            type: ActivityType.TRANSFER_VET,
            direction: DIRECTIONS.UP,
            outputs: [],
            amount,
            tokenAddress: "0x0",
        })
    })
})
