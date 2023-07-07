import {
    AccountWithDevice,
    TransactionOrigin,
    TransferEventResult,
} from "~Model"
import { AddressUtils } from "~Utils"

export const findInvolvedAccount = (
    visibleAccounts: AccountWithDevice[],
    decodedTransfer: TransferEventResult,
) => {
    let origin = ""

    const foundAccount = visibleAccounts.find(acc => {
        if (AddressUtils.compareAddresses(acc.address, decodedTransfer.to)) {
            origin = TransactionOrigin.TO
            return acc
        }

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
