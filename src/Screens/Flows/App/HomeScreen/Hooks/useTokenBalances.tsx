import {
    setTokenBalances,
    useAppDispatch,
    useAppSelector,
    useGetTokensFromGithubQuery,
} from "~Storage/Redux"
import { DEFAULT_VECHAIN_TOKENS_MAP } from "~Common/Constant"
import { useThor } from "~Components"
import { useEffect } from "react"
import BigNumber from "bignumber.js"
import {
    selectAccountBalances,
    selectCurrency,
    selectSelectedAccount,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import {
    fetchExchangeRate,
    updateAccountBalances,
} from "~Storage/Redux/Actions"

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
    const currentAccount = useAppSelector(selectSelectedAccount)
    const currentNetwork = useAppSelector(selectSelectedNetwork)
    const balances = useAppSelector(selectAccountBalances)
    const currency = useAppSelector(selectCurrency)
    const thorClient = useThor()

    useGetTokensFromGithubQuery({
        networkGenesisId: currentNetwork.genesisId,
        networkType: currentNetwork.type,
    })

    /**
     * init default balances
     */
    useEffect(() => {
        if (
            currentAccount?.address &&
            currentNetwork.genesisId &&
            balances?.length === 0
        ) {
            const defaultTokens = DEFAULT_VECHAIN_TOKENS_MAP.get(
                currentNetwork.type,
            )
            if (defaultTokens)
                dispatch(
                    setTokenBalances(
                        defaultTokens.map(token => ({
                            accountAddress: currentAccount?.address,
                            tokenAddress: token.address,
                            balance: "0",
                            timeUpdated: new Date().toISOString(),
                        })),
                    ),
                )
            dispatch(updateAccountBalances(thorClient))
        }
    }, [
        currentNetwork.genesisId,
        currentNetwork.type,
        currentAccount?.address,
        dispatch,
        thorClient,
        balances,
    ])

    useEffect(() => {
        const updateBalances = () => {
            // Update balances
            dispatch(updateAccountBalances(thorClient))
        }
        updateBalances()
        const interval = setInterval(updateBalances, TOKEN_BALANCE_SYNC_PERIOD)
        return () => clearInterval(interval)
    }, [dispatch, thorClient])

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
