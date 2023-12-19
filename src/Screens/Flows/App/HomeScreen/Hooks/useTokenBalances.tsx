import {
    autoSelectSuggestTokens,
    fetchExchangeRates,
    resetTokenBalances,
    selectCoinGeckoTokens,
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
import { useThor } from "~Components"
import { useCallback, useEffect } from "react"
import BigNumber from "bignumber.js"

// If the env variable isn't set, use the default
const EXCHANGE_RATE_SYNC_PERIOD = new BigNumber(process.env.REACT_APP_EXCHANGE_RATE_SYNC_PERIOD ?? "120000").toNumber()

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

    const coinGeckoTokens = useAppSelector(selectCoinGeckoTokens)

    const updateBalances = useCallback(async () => {
        // Update balances
        if (balances.length > 0) {
            await dispatch(updateAccountBalances(thorClient, selectedAccount.address))
        }
    }, [balances.length, dispatch, selectedAccount.address, thorClient])

    const updateSuggested = useCallback(async () => {
        await dispatch(updateSuggestedTokens(selectedAccount.address, officialTokens, network))
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
        if (
            balances.length === 0 ||
            missingSuggestedTokens.length === 0 ||
            thorClient.genesis.id !== network.genesis.id
        )
            return

        dispatch(autoSelectSuggestTokens(selectedAccount.address, missingSuggestedTokens, network, thorClient))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dispatch,
        missingSuggestedTokens.length,
        selectedAccount.address,
        thorClient.genesis.id,
        network.genesis.id,
        balances.length,
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

    /**
     * keeps exchange rates up to date
     */
    useEffect(() => {
        const updateVechainExchangeRates = () => {
            dispatch(fetchExchangeRates({ coinGeckoTokens }))
        }

        updateVechainExchangeRates()

        const interval = setInterval(updateVechainExchangeRates, EXCHANGE_RATE_SYNC_PERIOD)
        return () => clearInterval(interval)
    }, [dispatch, coinGeckoTokens])

    return {
        updateBalances,
        updateSuggested,
    }
}
