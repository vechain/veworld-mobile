import { AccountWithDevice, TransferEventResult } from "~Model"
import { AddressUtils } from "~Utils"

export const findInvolvedAccount = (
    visibleAccounts: AccountWithDevice[],
    decodedTransfer: TransferEventResult,
) => {
    let origin = ""

    const foundAccount = visibleAccounts.find(acc => {
        if (AddressUtils.compareAddresses(acc.address, decodedTransfer.to)) {
            origin = "to"
            return acc
        }

        if (AddressUtils.compareAddresses(acc.address, decodedTransfer.from)) {
            origin = "from"
            return acc
        }
    })

    return {
        account: foundAccount,
        origin,
    }
}
