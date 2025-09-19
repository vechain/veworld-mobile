import { QueryClient } from "@tanstack/react-query"
import { AddressUtils } from "~Utils"
import { selectSelectedNetwork } from "../Selectors"
import { AppThunkDispatch, RootState } from "../Types"

/**
 * Update user tokens
 */
export const invalidateUserTokens =
    (accountAddress: string, queryClient: QueryClient) =>
    async (_dispatch: AppThunkDispatch, getState: () => RootState) => {
        const network = selectSelectedNetwork(getState())
        await queryClient.invalidateQueries({
            predicate(query) {
                const queryKey = query.queryKey as string[]
                if (!["TOKENS"].includes(queryKey[0])) return false
                if (queryKey[1] !== "USER") return false
                if (!AddressUtils.compareAddresses(queryKey[2], accountAddress)) return false
                if (queryKey[3] !== network.genesis.id) return false
                return true
            },
        })
    }
