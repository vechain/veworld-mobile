import { useQueries } from "@tanstack/react-query"
import { fetchVeBetterActions, FetchVeBetterActionsResponseItem, PaginationResponse } from "~Networking"
import { selectAccountsWithoutObserved, useAppSelector } from "~Storage/Redux"

/**
 * Hook that checks if any of the user's wallets have VeBetter actions
 * @returns boolean indicating if any wallet has VeBetter actions
 */
export const useHasAnyVeBetterActions = () => {
    const accounts = useAppSelector(selectAccountsWithoutObserved)

    return useQueries({
        queries: accounts.map(account => ({
            queryKey: ["USER", "VEBETTER", account.address],
            queryFn: () => fetchVeBetterActions(account.address),
            select: (data: { data: FetchVeBetterActionsResponseItem[]; pagination: PaginationResponse }) =>
                data.data.length > 0,
            staleTime: 5 * 60 * 1000,
            gcTime: Infinity,
        })),
        combine: results => {
            return {
                data: results.some(result => result.data === true),
                isLoading: results.some(result => result.isLoading),
                isError: results.some(result => result.isError),
            }
        },
    })
}
