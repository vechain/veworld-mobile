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
    updateOfficialTokensBalances,
    selectNonVechainTokensWithBalances,
    selectHasFetchedOfficialTokens,
} from "~Storage/Redux"
import { useThor } from "~Components"
import { useCallback, useEffect } from "react"
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

    const nonVechainBalances = useAppSelector(
        selectNonVechainTokensWithBalances,
    )

    const hasFetchedOfficialTokens = useAppSelector(
        selectHasFetchedOfficialTokens,
    )

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

    const updateBalances = useCallback(async () => {
        // Update balances
        if (balances.length > 0) {
            await dispatch(
                updateAccountBalances(thorClient, selectedAccount.address),
            )

            if (nonVechainBalances.length <= 0 && !hasFetchedOfficialTokens) {
                await dispatch(
                    updateOfficialTokensBalances(
                        thorClient,
                        selectedAccount.address,
                    ),
                )
            }
        } else
            await dispatch(
                updateOfficialTokensBalances(
                    thorClient,
                    selectedAccount.address,
                ),
            )
    }, [
        balances.length,
        dispatch,
        hasFetchedOfficialTokens,
        nonVechainBalances.length,
        selectedAccount.address,
        thorClient,
    ])

    /**
     * keep balances up to date
     */
    useEffect(() => {
        // if genesis id is not the same, it means thorClient is not updated yet
        if (thorClient.genesis.id !== network.genesis.id) return

        updateBalances()

        const interval = setInterval(updateBalances, TOKEN_BALANCE_SYNC_PERIOD)
        return () => clearInterval(interval)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dispatch,
        thorClient,
        network,
        selectedAccount,
        nonVechainBalances.length,
        balances.length,
    ])

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

    return {
        updateBalances,
    }
}
