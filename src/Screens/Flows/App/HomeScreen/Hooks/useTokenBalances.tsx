import {
    useAppDispatch,
    useAppSelector,
    selectSelectedAccountBalances,
    selectSelectedNetwork,
    selectCurrency,
    fetchExchangeRate,
    updateAccountBalances,
    useGetTokensFromGithubQuery,
    resetTokenBalances,
    selectSelectedAccount,
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
 * This component is responsible for keeping the available tokens, balances and currency data up to date.
 * We will use hooks to trigger calls to the external services we use to update this date.
 * The reason this is a separate component is in order to remove any dependencies on these external services.
 * If they are down we want the wallet to continue to function.
 */
export const useTokenBalances = () => {
    const dispatch = useAppDispatch()
    const currentNetwork = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const balances = useAppSelector(selectSelectedAccountBalances)
    const currency = useAppSelector(selectCurrency)
    const thorClient = useThor()
    const balancesKey = balances?.map(balance => balance.tokenAddress).join("-")

    useGetTokensFromGithubQuery({
        networkGenesisId: currentNetwork.genesis.id,
        networkType: currentNetwork.type,
    })

    /**
     * init default balances if no balances found on redux
     */
    useEffect(() => {
        if (balances?.length === 0 && selectedAccount?.address) {
            dispatch(resetTokenBalances)
            dispatch(updateAccountBalances(thorClient, selectedAccount.address))
        }
    }, [dispatch, thorClient, selectedAccount, balances, currentNetwork])

    useEffect(() => {
        const updateBalances = () => {
            // Update balances
            if (selectedAccount?.address)
                dispatch(
                    updateAccountBalances(thorClient, selectedAccount.address),
                )
        }
        updateBalances()
        const interval = setInterval(updateBalances, TOKEN_BALANCE_SYNC_PERIOD)
        return () => clearInterval(interval)
    }, [
        dispatch,
        thorClient,
        selectedAccount,
        balancesKey,
        currentNetwork?.genesis.id,
    ])

    useEffect(() => {
        const updateVechainExchangeRates = () => {
            // Update VET exchange rate
            dispatch(fetchExchangeRate("VET", currency))
            // Update VTHO exchange rate
            dispatch(fetchExchangeRate("VTHO", currency))
        }
        updateVechainExchangeRates()
        const interval = setInterval(
            updateVechainExchangeRates,
            EXCHANGE_RATE_SYNC_PERIOD,
        )
        return () => clearInterval(interval)
    }, [dispatch, currency])
}
