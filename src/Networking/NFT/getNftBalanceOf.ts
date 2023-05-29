import { abis } from "~Common/Constant/Thor/ThorConstants"
import { isEmpty } from "lodash"

export const getNftBalanceOf = async (
    ownerAddress: string,
    contractAddress: string,
    thor: Connex.Thor,
) => {
    const res = await thor
        .account(contractAddress)
        .method(abis.VIP181.balanceOf)
        .call(ownerAddress)
    return isEmpty(res.decoded[0]) ? 0 : res.decoded[0]
}
