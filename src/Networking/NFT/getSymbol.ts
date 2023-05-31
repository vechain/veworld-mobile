import { abis } from "~Common/Constant/Thor/ThorConstants"
import { isEmpty } from "lodash"

export const getSymbol = async (
    contractAddress: string,
    thor: Connex.Thor,
): Promise<string> => {
    const symbol = await thor
        .account(contractAddress)
        .method(abis.VIP181.symbol)
        .call()
    return isEmpty(symbol.decoded[0]) ? "N/A" : symbol.decoded[0]
}
