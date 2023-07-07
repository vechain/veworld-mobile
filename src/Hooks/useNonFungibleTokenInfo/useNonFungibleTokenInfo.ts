import { useCallback } from "react"
import { useThor } from "~Components"
import { getName } from "~Networking"

export const useNonFungibleTokenInfo = () => {
    const thor = useThor()

    const fetchData = useCallback(
        async (_tokenAddress: string) => {
            return await getName(_tokenAddress, thor)
        },
        [thor],
    )

    return {
        fetchData,
    }
}
