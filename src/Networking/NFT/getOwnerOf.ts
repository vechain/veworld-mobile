import { abis } from "~Constants"
import { isEmpty } from "lodash"

export const getOwnerOf = async (
    tokenId: string,
    contractAddress: string,
    thor: Connex.Thor,
): Promise<string> => {
    const res = await thor
        .account(contractAddress)
        .method(abis.VIP181.ownerOf)
        .call(tokenId)
    return isEmpty(res.decoded[0]) ? "N/A" : res.decoded[0]
}
