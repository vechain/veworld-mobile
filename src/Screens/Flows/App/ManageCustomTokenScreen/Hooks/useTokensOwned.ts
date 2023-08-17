import { useCallback, useEffect, useState } from "react"
import { AddressUtils, error, info } from "~Utils"
import { showWarningToast, useThor } from "~Components"
import { Balance } from "~Model"
import {
    selectSelectedAccount,
    selectVisibleBalances,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"

import { useI18nContext } from "~i18n"
import { fetchTokensOwned } from "~Networking"

/**
 * React hook to manage fetching and storing token balances owned by an account.
 *
 * @returns An object with the following properties:
 * - `fetchTokens`: A function to fetch the token balances.
 * - `tokens`: The list of fetched tokens.
 * - `hasFetched`: A flag indicating whether tokens have been fetched.
 * - `page`: The current page number.
 * - `setPage`: A function to update the page number.
 */
export const useTokensOwned = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const network = useAppSelector(selectSelectedNetwork)

    const balances = useAppSelector(selectVisibleBalances)

    const { LL } = useI18nContext()

    const thor = useThor()

    // State variables
    const [hasFetched, setHasFetched] = useState<boolean>(false) // Indicates if tokens have been fetched
    const [page, setPage] = useState<number>(0) // Current page number
    const [tokens, setTokens] = useState<Balance[]>([]) // Current set of fetched tokens

    // Helper function to filter out tokens that are already selected to be shown in the home screen
    const filterNonSelectedTokens = useCallback(
        (tokensToFilter: Balance[], balancesList: Balance[]): Balance[] => {
            return tokensToFilter.filter(
                (token: Balance) =>
                    balancesList.find((balance: Balance) =>
                        AddressUtils.compareAddresses(
                            token.tokenAddress,
                            balance.tokenAddress,
                        ),
                    ) === undefined,
            )
        },
        [],
    )

    const fetchTokens = useCallback(async () => {
        info("Fetching tokens owned on page", page)
        // Reset hasFetched flag
        setHasFetched(false)
        // Proceed if address exists
        if (selectedAccount) {
            try {
                // Fetch tokens owned
                const tokensOwned = await fetchTokensOwned(
                    selectedAccount.address,
                    page,
                    thor,
                    network,
                )

                if (tokensOwned.length === 0) {
                    setHasFetched(true)
                    return
                }

                const tokensNotSelected = filterNonSelectedTokens(
                    tokensOwned,
                    balances,
                )

                if (page === 0) {
                    setTokens(tokensNotSelected)
                    incrementPageAndSetFetchedFlag()
                    return
                }

                setTokens(prevTokens => [...prevTokens, ...tokensNotSelected])

                incrementPageAndSetFetchedFlag()
            } catch (e) {
                // In case of error, log and show warning toast
                error("fetchTokens", e)

                showWarningToast(LL.HEADS_UP(), LL.CUSTOM_TOKENS_NOT_AVAIABLE())

                // Set fetched flag
                setHasFetched(true)
            }
        }
    }, [
        page,
        selectedAccount,
        thor,
        network,
        filterNonSelectedTokens,
        balances,
        LL,
    ])

    // Helper function to increment page and set fetched flag
    const incrementPageAndSetFetchedFlag = () => {
        setPage(prevPage => prevPage + 1)
        setHasFetched(true)
    }

    useEffect(() => {
        const fetchOnMount = async () => {
            await fetchTokens()
        }

        if (page === 0) fetchOnMount()
    }, [fetchTokens, page])

    // When balances are updated, remove the balances from the tokens state
    useEffect(() => {
        if (tokens.length === 0) return

        const tokensNotSelected = filterNonSelectedTokens(tokens, balances)
        setTokens(tokensNotSelected)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balances])

    // Reset page number on network change or on account change
    useEffect(() => {
        if (page > 0) setPage(0)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [network.type, selectedAccount])

    return {
        fetchTokens,
        tokens,
        hasFetched,
        page,
        setPage,
    }
}
