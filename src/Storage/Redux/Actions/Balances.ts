import { Dispatch } from "@reduxjs/toolkit"
import { QueryClient } from "@tanstack/react-query"
import { selectSelectedNetwork } from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import { AddressUtils } from "~Utils"

/**
 * Invalidate balances for an account
 * @param accountAddress - the account address for this balance
 * @param force - Query client that can be retrieved with `useQueryClient`
 */
export const updateAccountBalances =
    (accountAddress: string, queryClient: QueryClient) => async (dispatch: Dispatch, getState: () => RootState) => {
        const network = selectSelectedNetwork(getState())
        await queryClient.invalidateQueries({
            predicate(query) {
                const queryKey = query.queryKey as string[]
                if (!["TOKENS", "BALANCE"].includes(queryKey[0])) return false
                if (!["SINGLE", "MULTIPLE", "TOTAL"].includes(queryKey[1])) return false
                if (!AddressUtils.compareAddresses(queryKey[2], accountAddress)) return false
                if (queryKey[3] !== network.genesis.id) return false
                return true
            },
        })
    }
