import { useMemo } from "react"
import { NON_SENDABLE_TOKENS } from "~Constants"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import { FungibleTokenWithBalance } from "~Model"

export const useSwapTokens = () => {
    const availableTokens = useSendableTokensWithBalance({ includeVOT3: true })

    const tokensWithBalance: FungibleTokenWithBalance[] = useMemo(() => {
        return availableTokens.filter(token => !NON_SENDABLE_TOKENS.includes(token.symbol))
    }, [availableTokens])

    return { tokensWithBalance }
}
