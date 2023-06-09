import {
    useAppDispatch,
    useAppSelector,
    selectSelectedAccountBalances,
    selectSelectedNetwork,
    updateAccountBalances,
    resetTokenBalances,
    fetchTokensWithInfo,
    fetchExchangeRates,
    selectCoinGeckoTokens,
    selectSelectedAccount,
    getTokensFromGithub,
    addOfficialTokens,
} from "~Storage/Redux"
import { useThor } from "~Components"
import { useEffect } from "react"
import BigNumber from "bignumber.js"

// If the env variable isn't set, use the default
const EXCHANGE_RATE_SYNC_PERIOD = new BigNumber(
    process.env.REACT_APP_EXCHANGE_RATE_SYNC_PERIOD || "120000",
).toNumber()

// If the env variable isn't set, use the default
const TOKEN_BALANCE_SYNC_PERIOD = new BigNumber(
    process.env.REACT_APP_TOKEN_BALANCE_SYNC_PERIOD || "300000",
).toNumber()

/**
 * This hook is responsible for keeping the available tokens, balances and exchange rates data up to date.
 */
export const useTokenBalances = () => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const balances = useAppSelector(selectSelectedAccountBalances)
    const thorClient = useThor()
    const coinGeckoTokens = useAppSelector(selectCoinGeckoTokens)

    // fetch official tokens from github
    useEffect(() => {
        ;(async () => {
            const tokens = await getTokensFromGithub({
                network,
            })
            dispatch(addOfficialTokens(tokens))
        })()
    }, [network, dispatch])

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
        const updateBalances = () => {
            // Update balances
            dispatch(updateAccountBalances(thorClient, selectedAccount.address))
        }
        updateBalances()
        const interval = setInterval(updateBalances, TOKEN_BALANCE_SYNC_PERIOD)
        return () => clearInterval(interval)
    }, [dispatch, thorClient, network, selectedAccount])

    /**
     * fetch tokens with info
     */
    useEffect(() => {
        dispatch(fetchTokensWithInfo())
    }, [dispatch])

    /**
     * keeps exchange rates up to date
     */
    useEffect(() => {
        const updateVechainExchangeRates = () => {
            dispatch(fetchExchangeRates({ coinGeckoTokens }))
        }

        updateVechainExchangeRates()

        const interval = setInterval(
            updateVechainExchangeRates,
            EXCHANGE_RATE_SYNC_PERIOD,
        )
        return () => clearInterval(interval)
    }, [dispatch, coinGeckoTokens])
}
