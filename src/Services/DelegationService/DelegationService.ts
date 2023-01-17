import axios from "axios"
import { veWorldErrors } from "~Common/Errors"
import { Transaction } from "thor-devkit"
import HexUtils from "~Common/Utils/HexUtils/HexUtils"

/**
 * TODO: Can be used later on to delegation in-extension transactions
 */

const delegate = async (
    tx: Transaction,
    delegationUrl: string,
    accAddress: string,
): Promise<Buffer> => {
    // build hex encoded version of the transaction for signing request
    const rawTransaction = HexUtils.addPrefix(tx.encode().toString("hex"))

    // request to send for sponsorship/fee delegation
    const sponsorRequest = {
        origin: accAddress,
        raw: rawTransaction,
    }

    // request sponsorship
    const response = await axios.post(delegationUrl, sponsorRequest)

    if (response.data.error || !response.data.signature)
        throw veWorldErrors.rpc.transactionRejected({
            message: "Failed to get signature from delegator",
        })

    return Buffer.from(response.data.signature.substr(2), "hex")
}

export default {
    delegate,
}
