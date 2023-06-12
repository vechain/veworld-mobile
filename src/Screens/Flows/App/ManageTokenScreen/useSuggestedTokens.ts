import { useEffect } from "react"
import { error, BalanceUtils } from "~Utils"
import { useThor } from "~Components"
import {
    selectNonVechainFungibleTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    setSuggestedTokens,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { FungibleTokenWithBalance } from "~Model"

export const useSuggestedTokens = (selectedTokenSymbols: string[]) => {
    const dispatch = useAppDispatch()
    const officialTokens = useAppSelector(selectNonVechainFungibleTokens)
    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)

    const thorClient = useThor()

    const updateSuggestedTokens = async () => {
        if (selectedTokenSymbols.length === 0) {
            const newSuggestedTokens: FungibleTokenWithBalance[] = []
            for (const token of officialTokens) {
                try {
                    const balance = await BalanceUtils.getBalanceFromBlockchain(
                        token.address,
                        account.address,
                        network,
                        thorClient,
                    )
                    if (!new BigNumber(balance.balance).isZero()) {
                        newSuggestedTokens.push({
                            ...token,
                            balance: balance,
                        })
                    }
                } catch (e) {
                    error("Can't fetch balance for token: ", token)
                }
            }
            dispatch(setSuggestedTokens(newSuggestedTokens))
        }
    }

    useEffect(() => {
        updateSuggestedTokens()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
