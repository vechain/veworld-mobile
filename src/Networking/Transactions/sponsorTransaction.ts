import axios from "axios"

/**
 * ask the sponsor url to sign the transaction
 */
export const sponsorTransaction = async (
    delegateUrl: string,
    sponsorRequest: {
        origin: string
        raw: string
    },
) => {
    const response = await axios.post(delegateUrl, sponsorRequest)
    return response.data.signature
}
