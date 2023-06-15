import axios from "axios"
import { Transaction } from "thor-devkit"
import { HexUtils } from "~Utils"

/**
 * send signed transaction with thorest apis
 */
export const sendTransaction = async (tx: Transaction, networkUrl: string) => {
    const encodedRawTx = {
        raw: HexUtils.addPrefix(tx.encode().toString("hex")),
    }

    const response = await axios.post(
        `${networkUrl}/transactions`,
        encodedRawTx,
    )

    return response.data.id
}
