import { AccountWithDevice, TransactionOrigin } from "~Model"
import { IncomingTransferResponse } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const findInvolvedAccount = (
    visibleAccounts: AccountWithDevice[],
    decodedTransfer: IncomingTransferResponse,
) => {
    let origin = ""

    const foundAccount = visibleAccounts.find(acc => {
        if (AddressUtils.compareAddresses(acc.address, decodedTransfer.to)) {
            origin = TransactionOrigin.TO
            return acc
        }

        // NOTE - if a user transfers to himself (same or different account), the transfer will be indexed as an outgoing operation
        if (AddressUtils.compareAddresses(acc.address, decodedTransfer.from)) {
            origin = TransactionOrigin.FROM
            return acc
        }
    })

    return {
        account: foundAccount,
        origin,
    }
}
