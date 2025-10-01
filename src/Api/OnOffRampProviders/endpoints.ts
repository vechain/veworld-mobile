import axios from "axios"
import { ERROR_EVENTS } from "~Constants"
import { error } from "~Utils"
import { GenerateUrlResponse } from "./types"

/**
 *
 * @param address Address of the user
 * @param baseURL Base URL (retrieved from FF)
 * @returns The generated coinbase URL
 */
export const generateCoinbaseOnRampURL = async (
    address: string,
    baseURL: string = "https://onramp-proxy.vechain.org",
) => {
    const result = await axios.get("/", {
        params: {
            address,
            provider: "coinbase",
        },
        baseURL,
    })

    if (result.status !== 200) {
        error(ERROR_EVENTS.BUY, "Error while generating coinbase URL", result.data)
        throw new Error("Error while generating coinbase URL")
    }

    return (result.data as GenerateUrlResponse).url
}
