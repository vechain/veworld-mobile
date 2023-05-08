import { useEffect } from "react"
import { BalanceUtils } from "~Common"
import { useThor } from "~Components"
import {
    selectOfficialTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectSuggestedTokens,
    setSuggestedTokens,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { FungibleTokenWithBalance } from "~Model"

export const useSuggestedTokens = (selectedTokenSymbols: string[]) => {
    const dispatch = useAppDispatch()
    const officialTokens = useAppSelector(selectOfficialTokens)
    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const suggestedTokens = useAppSelector(selectSuggestedTokens)
    const thorClient = useThor()
    const missingSuggestedTokens =
        suggestedTokens?.filter(
            token => !selectedTokenSymbols.includes(token.symbol),
        ) || []

    const updateSuggestedTokens = async () => {
        if (selectedTokenSymbols.length === 0 && account?.address) {
            const newSuggestedTokens: FungibleTokenWithBalance[] = []
            for (const token of officialTokens) {
                const balance = await BalanceUtils.getBalanceFromBlockchain(
                    token.address,
                    account?.address,
                    network,
                    thorClient,
                )
                if (!new BigNumber(balance.balance).isZero()) {
                    newSuggestedTokens.push({ ...token, balance: balance })
                }
            }
            dispatch(setSuggestedTokens(newSuggestedTokens))
        }
    }

    useEffect(() => {
        updateSuggestedTokens()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        missingSuggestedTokens,
    }
}
