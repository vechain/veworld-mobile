import { useCallback, useEffect } from "react"
import { useThor } from "~Components"
import { VeDelegate } from "~Constants"
import { useGetVeDelegateBalance } from "~Hooks"
import {
    autoSelectSuggestTokens,
    resetTokenBalances,
    selectMissingSuggestedTokens,
    selectOfficialTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectVisibleBalances,
    updateAccountBalances,
    updateOfficialTokens,
    updateSuggestedTokens,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { BigNutils } from "~Utils"

/**
 * This hook is responsible for keeping the available tokens, balances and exchange rates data up to date.
 */
export const useTokenBalances = () => {
    const dispatch = useAppDispatch()

    const network = useAppSelector(selectSelectedNetwork)

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const officialTokens = useAppSelector(selectOfficialTokens)

    const missingSuggestedTokens = useAppSelector(selectMissingSuggestedTokens)

    const balances = useAppSelector(selectVisibleBalances)

    const thorClient = useThor()

    const { data: veDelegateBalance } = useGetVeDelegateBalance(selectedAccount.address)

    const updateBalances = useCallback(
        async (force = false) => {
            await dispatch(updateAccountBalances(thorClient, selectedAccount.address, force))
        },
        [dispatch, selectedAccount.address, thorClient],
    )

    const updateSuggested = useCallback(async () => {
        await dispatch(updateSuggestedTokens(selectedAccount.address, [...officialTokens, VeDelegate], network))
    }, [dispatch, network, officialTokens, selectedAccount.address])

    // fetch official tokens from github
    useEffect(() => {
        dispatch(updateOfficialTokens(network))
    }, [network, dispatch])

    // fetch suggested tokens
    useEffect(() => {
        if (officialTokens.length <= 2) return

        updateSuggested()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, network.genesis.id, selectedAccount.address, officialTokens.length])

    // auto select suggested tokens if they don't exist already
    useEffect(() => {
        const missingTokens = [...missingSuggestedTokens]

        if (!BigNutils(veDelegateBalance?.formatted ?? "0").isZero && !missingTokens.includes(VeDelegate.address)) {
            missingTokens.push(VeDelegate.address)
        }

        if (balances.length === 0 || missingTokens.length === 0 || thorClient.genesis.id !== network.genesis.id) return

        dispatch(autoSelectSuggestTokens(selectedAccount.address, missingTokens, network, thorClient))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dispatch,
        missingSuggestedTokens.length,
        selectedAccount.address,
        thorClient.genesis.id,
        network.genesis.id,
        balances.length,
        veDelegateBalance,
    ])

    /**
     * init default balances if no balances found on redux
     */
    useEffect(() => {
        if (balances.length === 0 && selectedAccount) {
            dispatch(resetTokenBalances)
            dispatch(updateAccountBalances(thorClient, selectedAccount.address))
        }
    }, [dispatch, thorClient, network, selectedAccount, balances.length])

    /**
     * keep balances up to date
     */
    useEffect(() => {
        // if genesis id is not the same, it means thorClient is not updated yet
        if (thorClient.genesis.id !== network.genesis.id) return

        updateBalances()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thorClient.genesis.id, network.genesis.id, balances.length, dispatch, selectedAccount.address])

    return {
        updateBalances,
        updateSuggested,
    }
}
