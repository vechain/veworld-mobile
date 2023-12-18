import axios, { AxiosError, AxiosResponse } from "axios"
import { ERROR_EVENTS } from "~Constants"
import { error } from "~Utils"

/**
 * ask the sponsor url to sign the transaction
 */
export const sponsorTransaction = async (
    delegateUrl: string,
    sponsorRequest: {
        origin: string
        raw: string
    },
): Promise<string> => {
    let response: AxiosResponse

    try {
        response = await axios.post(delegateUrl, sponsorRequest)
    } catch (e) {
        if (e instanceof AxiosError) {
            const axiosError = e as AxiosError

            error(ERROR_EVENTS.SEND, JSON.stringify(axiosError.toJSON()))
        } else {
            error(ERROR_EVENTS.SEND, e)
        }

        throw e
    }

    return response.data.signature
}
