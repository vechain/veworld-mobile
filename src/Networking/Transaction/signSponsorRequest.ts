import axios from "axios"
import { error } from "~Utils/Logger"

export const signSponsorRequest = async (
    delegateUrl: string,
    sponsorRequest: {
        origin: string
        raw: string
    },
    onFail?: (e: unknown) => void,
) => {
    const response = await axios
        .post(delegateUrl, sponsorRequest)
        .catch((e: unknown) => {
            error(e)

            if (onFail) {
                onFail(e)
            }

            throw e
        })
    return response
}
