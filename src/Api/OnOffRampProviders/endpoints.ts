import axios, { AxiosResponse } from "axios"
import { CURRENCY, ERROR_EVENTS, ThemeEnum } from "~Constants"
import { error } from "~Utils"
import { GenerateTransakUrlResponse, GenerateUrlResponse } from "./types"
import { Platform } from "react-native"

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

/**
 *
 * @param address Address of the user
 * @param baseURL Base URL (retrieved from FF)
 * @param currency User's preferred currency
 * @param theme Theme preference (light/dark)
 * @returns The generated Transak URL response
 */
export const generateTransakOnRampURL = async (
    address: string,
    baseURL: string = "https://onramp-proxy.vechain.org",
    currency: CURRENCY,
    theme: ThemeEnum,
) => {
    const result = await axios.get<GenerateTransakUrlResponse>("/", {
        params: {
            address,
            provider: "transak",
            os: Platform.OS,
            currency,
            theme: theme.toUpperCase(),
        },
        headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
        },
        baseURL,
        timeout: 15000, // 15 second timeout
    })

    if (result.status !== 200 || !result.data.url) {
        error(ERROR_EVENTS.BUY, "Error while generating transak URL", result.data)
        throw new Error("Error while generating transak URL")
    }

    return result.data
}
