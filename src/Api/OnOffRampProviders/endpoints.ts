import axios from "axios"
import { ERROR_EVENTS } from "~Constants"
import { error } from "~Utils"
import { GenerateUrlResponse } from "./types"

const axiosInstance = axios.create({
    baseURL: "https://fskkwvmazl.execute-api.eu-west-1.amazonaws.com/veworld-onramp-proxy-dev-api-1",
})

export const generateCoinbaseOnRampURL = async (address: string) => {
    const result = await axiosInstance.get("/", {
        params: {
            address,
            provider: "coinbase",
        },
    })

    if (result.status !== 200) {
        error(ERROR_EVENTS.BUY, "Error while generating coinbase URL", result.data)
        throw new Error("Error while generating coinbase URL")
    }

    return (result.data as GenerateUrlResponse).url
}
