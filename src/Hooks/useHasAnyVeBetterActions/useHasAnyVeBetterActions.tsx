import { queryOptions, useQueries } from "@tanstack/react-query"
import { IndexerClient, useMainnetIndexerClient } from "~Hooks/useIndexerClient"
import { selectAccountsWithoutObserved, useAppSelector } from "~Storage/Redux"

const buildQueryOptions = (account: string, indexer: IndexerClient) =>
    queryOptions({
        queryKey: ["USER", "VEBETTER", account],
        queryFn: () =>
            indexer
                .GET("/api/v1/b3tr/actions/users/{wallet}", {
                    params: {
                        path: {
                            wallet: account,
                        },
                        query: {
                            page: 0,
                            size: 1,
                        },
                    },
                })
                .then(res => res.data!),
        select: data => data.data.length > 0,
        staleTime: 5 * 60 * 1000,
    })

/**
 * Hook that checks if any of the user's wallets have VeBetter actions
 * @returns boolean indicating if any wallet has VeBetter actions
 */
export const useHasAnyVeBetterActions = () => {
    const accounts = useAppSelector(selectAccountsWithoutObserved)
    const indexer = useMainnetIndexerClient()

    return useQueries({
        queries: accounts.map(account => buildQueryOptions(account.address, indexer)),
        combine: results => {
            return {
                data: results.some(result => result.data === true),
                isLoading: results.some(result => result.isLoading),
                isError: results.some(result => result.isError),
            }
        },
    })
}
