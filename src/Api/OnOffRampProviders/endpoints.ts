import axios, { AxiosResponse } from "axios"
import { ERROR_EVENTS } from "~Constants"
import { error } from "~Utils"
import { GenerateUrlResponse } from "./types"

/**
 *
 * @param address Address of the user
 * @param baseURL Base URL (retrieved from FF)
 * @param signature Signature for authentication
 * @param timestamp Timestamp used in signature
 * @returns The generated coinbase URL
 */
export const generateCoinbaseOnRampURL = async (
    address: string,
    baseURL: string = "https://onramp-proxy.vechain.org",
    signature?: string,
    timestamp?: number,
) => {
    let result: AxiosResponse<GenerateUrlResponse>

    result = await axios.get("/", {
        params: {
            address,
            provider: "coinbase",
        },
        headers:
            signature && timestamp
                ? {
                      "x-signature": signature,
                      "x-timestamp": timestamp.toString(),
                  }
                : undefined,
        baseURL,
        timeout: 15000, // 15 second timeout
    })

    if (result.status !== 200) {
        error(ERROR_EVENTS.BUY, "Error while generating coinbase URL", result.data)
        throw new Error("Error while generating coinbase URL")
    }

    return (result.data as GenerateUrlResponse).url
}
