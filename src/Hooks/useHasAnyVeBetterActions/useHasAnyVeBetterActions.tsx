import { useQueries } from "@tanstack/react-query"
import { fetchVeBetterUserGeneralOverview } from "~Networking"
import { selectAccountsWithoutObserved, useAppSelector } from "~Storage/Redux"

/**
 * Hook that checks if any of the user's wallets have VeBetter actions
 * @returns boolean indicating if any wallet has VeBetter actions
 */
export const useHasAnyVeBetterActions = () => {
    const accounts = useAppSelector(selectAccountsWithoutObserved)

    return useQueries({
        queries: accounts.map(account => ({
            queryKey: ["VEBETTER", "GENERAL", account.address],
            queryFn: () => fetchVeBetterUserGeneralOverview(account.address),
        })),
        combine: results => {
            return {
                data: results.some(result => result.data && result.data.actionsRewarded > 0),
                isLoading: results.some(result => result.isLoading),
                isError: results.some(result => result.isError),
            }
        },
    })
}
