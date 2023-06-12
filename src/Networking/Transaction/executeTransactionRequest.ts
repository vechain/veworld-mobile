import axios from "axios"
import { error } from "~Utils/Logger"

export const executeTransactionRequest = async (
    networkUrl: string,
    encodedRawTx: {
        raw: string
    },
    onFail?: (e: unknown) => void,
) => {
    const response = await axios
        .post(`${networkUrl}/transactions`, encodedRawTx)
        .catch(async e => {
            error(e)
            if (onFail) {
                onFail(e)
            }
            throw e
        })

    return response
}
